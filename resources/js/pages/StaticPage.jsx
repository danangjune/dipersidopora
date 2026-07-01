import CmsPage from './CmsPage';
import { normalizePath } from '../data/siteContent';

export function pageForPath(path) {
    return <CmsPage path={normalizePath(path)} />;
}