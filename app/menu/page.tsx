import { Menu } from '../../src/views/Menu';
import { Suspense } from 'react';

export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading menu...</div>}>
      <Menu />
    </Suspense>
  );
}
