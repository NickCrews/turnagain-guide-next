import { Badge } from "@/components/ui/badge"
import { ATES, atesColor, atesTextColor, ATES_VALUES } from "@/lib/terrain-rating"
import { capitalize } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Link from "@/components/ui/link"

export function AtesBadge({rating}: {rating: ATES}) {
  return <HoverCard>
    <HoverCardTrigger asChild>
      <Badge style={{backgroundColor: atesColor(rating), color: atesTextColor(rating)}}>{capitalize(rating)}</Badge>
    </HoverCardTrigger>
    <HoverCardContent>
      <p className="text-bold text-destructive">
        The rating is provided as a courtesy by the author, who has no official
        capacity to rate terrain. Use at your own risk.
      </p>
    
      <Link href='https://avalanche.org/avalanche-encyclopedia/terrain/avalanche-terrain-exposure/avalanche-terrain-exposure-scale-ates/'>
        ATES
      </Link> (Avalanche Terrain Exposure Scale)
      classifies terrain into five categories based on slope angle,
      forest density, slope shape, terrain traps, avalanche frequency/magnitude,
      starting zone size and density, runout zone characteristics,
      interaction with avalanche paths, and route options for managing exposure.
    </HoverCardContent>
  </HoverCard>
}

export function AtesBadges({ratings}: {ratings: ATES[]}) {
  return <>
    {ratings.map((rating) => <AtesBadge key={rating} rating={rating} />)}
  </>
}