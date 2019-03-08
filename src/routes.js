import Listen from './Pages/Listen';
import Extruder from './Pages/Extruder';

const routes = [
  {
    path: '/',
	exact: true,
	breadcrumb: 'Stream of Reddit',
	component: Listen,
  },
  {
	path: '/extruder',
	exact: true,
	breadcrumb: 'Extruder',
	component: Extruder,
  }
];

export default routes;
