'use client'

import {
  Viewer,
  GeoJsonDataSource,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  Color,
  Entity,
  ConstantProperty,
  ColorMaterialProperty,
  PolygonGraphics,
  Cartesian2,
  Cartesian3,
} from 'cesium'
import { useEffect, useState, useId, useRef} from 'react'

import { FeatureType, GeoItem } from '@/lib/geo-item';
import RouteCard from './RouteCard';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useViewer } from '@/app/components/ViewerContext';
import { ATES, atesColor, maxAtes } from '@/lib/terrain-rating';

interface MapProps {
  items: GeoItem[];
  selectedItem?: GeoItem;
  onItemClick?: (item?: GeoItem) => void;
}

interface PopupInfo {
  item: GeoItem;
  position: Cartesian3;
}

export default function Map({ items = [], onItemClick, selectedItem }: MapProps) {
  const holderId = useId();
  const viewer = useViewer(holderId);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  
  useEffect(() => {
    async function initViewer() {
      if (!viewer) {
        return;
      }
      const entities = await itemsToEntities(items);
      setViewerEntities(viewer, entities);
      viewer.entities.values.forEach(entity => styleEntity(entity, selectedItem));
    }
    initViewer();
  }, [viewer, items, selectedItem])

  useEffect(() => {
    if (!viewer || !onItemClick) {
      return;
    }
    const itemsById = Object.fromEntries(items.map(item => [item.id, item]));
    
    // on click, set the tooltip
    viewer.screenSpaceEventHandler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedEntity: Entity | undefined = viewer?.scene.pick(click.position)?.id;
      if (!pickedEntity) {
        setPopupInfo(null);
        return;
      }
      const item: GeoItem | undefined = itemsById[pickedEntity?.properties?.id];
      const worldPosition = viewer.scene.pickPosition(click.position);
      setPopupInfo({item, position: worldPosition});
    }, ScreenSpaceEventType.LEFT_CLICK);
    
    // on hover, change cursor to a pointer
    viewer.screenSpaceEventHandler.setInputAction((hover: ScreenSpaceEventHandler.MotionEvent) => {
      const pickedObject = viewer.scene.pick(hover.endPosition);
      viewer.scene.canvas.style.cursor = pickedObject ? 'pointer' : 'default';
    }, ScreenSpaceEventType.MOUSE_MOVE);
    
    return () => {
      viewer?.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
      viewer?.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, [viewer, onItemClick, items])
  
  useEffect(() => {
    if (!viewer || !popupInfo || !popupRef.current) {
      return;
    }
    const htmlOverlay = popupRef.current;
    const scratch2d = new Cartesian2();  // reduce number of allocations in tight loop
    const removeListener = viewer.scene.preRender.addEventListener(function () {
      const canvasPosition = viewer.scene.cartesianToCanvasCoordinates(
        popupInfo.position,
        scratch2d
      );
      htmlOverlay.style.top = canvasPosition.y + "px";
      htmlOverlay.style.left = canvasPosition.x + "px";
    });
    return removeListener;
  }, [viewer, popupInfo])

  return <div className="relative h-full w-full overflow-hidden">
    <div id={holderId} className="h-full w-full">
      {/* The singleton Viewer will get moved here on mount, and back to the parking element on unmount. */}
    </div>
    <div ref={popupRef} className="absolute -translate-x-1/2 -translate-y-full w-64">
      {popupInfo && <RouteCard item={popupInfo.item} onClick={onItemClick} />}
    </div>
    <div className="absolute bottom-4 right-4">
      <DownloadButton />
    </div>
  </div>
}

function DownloadButton() {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="bg-background/50 hover:bg-background/70 text-foreground px-3 py-1 rounded-md text-sm"
    >
      Download ▾
    </button>
    {isOpen && (
      <div
        className="absolute bottom-full right-0 mb-1 bg-background/50 rounded-md overflow-hidden"
      >
        <a
          href="/turnagain-pass.geojson"
          className="block gap-1"
          download="turnagain-pass.geojson"
        >
          .geojson
        </a>
        <a
          href="/turnagain-pass.gpx"
          className="block gap-1"
          download="turnagain-pass.gpx"
        >
          .gpx
        </a>
      </div>
    )}
  </>
}

async function itemsToEntities(items: GeoItem[]) {
  const dataSource = await GeoJsonDataSource.load({
    type: "FeatureCollection",
    features: items.map(i => ({ ...i, properties: { ...i.properties, id: i.id } })),
  }, {
    // In a perfect world I would set each entity to clampToGround
    // in modifiedEntity(), but I can't figure out how to do it there.
    clampToGround: true,
  });
  // Warning: if the geojson contains a MultiLineString, this single feature
  // will be split into multiple entities in the GeoJsonDataSource,
  // one for each segment of the MultiLineString.
  // This might also be a problem for MultiPolygons, etc, but not sure.
  // Currently, I was able to just convert all MultiLineStrings to LineStrings
  // in the source data, but this might not always be possible.
  return items.map(i => dataSource.entities.getById(i.id) as Entity);
}

// edits in-place
function styleEntity(entity: Entity, selectedItem?: GeoItem) {
  if (entity.polyline) {
    entity.polyline.width = new ConstantProperty(5);
  }

  // Workaround to get polygons to show up.
  // IDK exactly why this is needed, but if you want to go down the rabbit hole:
  // https://community.cesium.com/t/polygon-clamp-to-ground-when-terrain-provider-is-used/22798/6
  if (entity.polygon) {
    entity.polygon = new PolygonGraphics({
      hierarchy: entity.polygon.hierarchy?.getValue(),
    })
  }

  const featureType: FeatureType = entity.properties?.feature_type;
  const atesRatings: ATES[] = entity.properties?.nicks_ates_ratings.getValue();
  const cssColor = (atesRatings.length > 0) ? atesColor(maxAtes(atesRatings)) : 'black';
  let color = Color.fromCssColorString(cssColor);

  // If there is some selected item, and this entity is not the one selected, make this entity dull
  const dull = selectedItem && selectedItem.id != entity.properties?.id;
  if (entity.polygon) {
    if (dull) {
      color = color.withAlpha(0.1);
    } else {
      color = color.withAlpha(0.5);
    }
  } else if (entity.billboard) {
    if (dull) {
      color = color.withAlpha(0.2);
    } else {
      color = color;
    }
  } else {
    if (dull) {
      color = color.withAlpha(0.2);
    } else {
      color = color;
    }
  }

  if (entity.polygon) {
    entity.polygon.material = new ColorMaterialProperty(color);
  } else if (entity.polyline) {
    entity.polyline.material = new ColorMaterialProperty(color);
  } else if (entity.billboard) {
    if (featureType == "peak") {
      entity.billboard.image = makeImageProperty(SVG_PEAK, color);
    } else if (featureType == "parking") {
      entity.billboard.image = makeImageProperty(SVG_PARKING, color);
    } else {
      throw new Error(`Unknown feature type for billboard: ${featureType}`);
    }
    entity.billboard.width = new ConstantProperty(32);
    entity.billboard.height = new ConstantProperty(32);
  } else {
    throw new Error(`entity is not a billboard, polygon, or polyline: ${entity.properties?.id}`);
  }
}

function setViewerEntities(viewer: Viewer, entities: Entity[]) {
  function isMatch(e1: Entity, e2: Entity) {
    return e1.properties?.id?.getValue() == e2.properties?.id?.getValue();
  }

  // do in separate steps to avoid mutating the viewer while iterating over it
  const entitiesToRemove = viewer.entities.values.filter(existing => 
    !entities.some(entity => isMatch(existing, entity))
  );
  entitiesToRemove.forEach(entity => {
    viewer.entities.remove(entity);
  });

  const entitiesToAdd = entities.filter(entity => 
    !viewer.entities.values.some(existing => isMatch(existing, entity))
  );
  entitiesToAdd.forEach(entity => {
    viewer.entities.add(entity);
  });
}

// a triangle like ⏶
const SVG_PEAK = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <polygon points="50,10 90,90 10,90" fill="$ICON_COLOR" fill-opacity="$ICON_ALPHA" />
  </svg>
`;

// a "P" icon
const SVG_PARKING = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="$ICON_COLOR" fill-opacity="$ICON_ALPHA">
  <path d="M240-120v-720h280q100 0 170 70t70 170q0 100-70 170t-170 70H400v240H240Zm160-400h128q33 0 56.5-23.5T608-600q0-33-23.5-56.5T528-680H400v160Z"/>
</svg>
`;

function makeImageProperty(svgString: string, color?: string | Color, alpha?: number) {
  // See /globals.css for other colors
  color = color || "#ffffff";
  if (typeof color !== "string") {
    alpha = alpha || color.alpha;
    color = color.toCssHexString().slice(0, 7);
  }
  alpha = alpha || 1;
  svgString = svgString.replace("$ICON_COLOR", color);
  svgString = svgString.replace("$ICON_ALPHA", alpha.toString());
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  return new ConstantProperty(url);
}