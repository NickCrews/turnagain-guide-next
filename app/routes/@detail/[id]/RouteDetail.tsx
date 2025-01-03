import { Item } from '../../routes';
import { Modal } from '../../../components/Modal';

interface RouteDetailProps {
    item: Item;
    mountId: string;
  }

export default function RouteDetail({ item, mountId }: RouteDetailProps) {
  return (
    <Modal mountId={mountId}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">{item.properties.title}</h2>
        <p className="mb-4">{item.properties.description}</p>
      </div>
    </Modal>
    );
}