import { getDataPlaneById } from './data-planes';
import { getEdgeServiceById } from './services';
import { getEdgeRouteById } from './routes';
import { getEdgePolicyById } from './policies';

/**
 * Map a Scope's `scopeRequirement` + the URL's resource id to a friendly name
 * for breadcrumb / column header rendering. Falls back to the raw id if unknown.
 */
export function resolveScopeName(scopeRequirement: string, resourceId: string): string {
  switch (scopeRequirement) {
    case 'dataplane-id':
      return getDataPlaneById(resourceId)?.name ?? resourceId;
    case 'service-id':
      return getEdgeServiceById(resourceId)?.name ?? resourceId;
    case 'route-id': {
      const r = getEdgeRouteById(resourceId);
      return r ? `${r.method} ${r.path}` : resourceId;
    }
    case 'policy-id':
      return getEdgePolicyById(resourceId)?.name ?? resourceId;
    default:
      return resourceId;
  }
}
