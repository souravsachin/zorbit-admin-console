import { ModuleSetupPage } from '../../components/shared/ModuleSetupPage';
import { Calculator } from 'lucide-react';

export default function ProductPricingSetupPage() {
  return (
    <ModuleSetupPage
      moduleId="product_pricing"
      moduleName="Product Pricing"
      icon={Calculator}
      seedEndpoint="/api/product_pricing/api/v1/G/product_pricing/seed/system"
      demoSeedEndpoint="/api/product_pricing/api/v1/G/product_pricing/seed/demo"
      demoFlushEndpoint="/api/product_pricing/api/v1/G/product_pricing/seed/demo"
      flushEndpoint="/api/product_pricing/api/v1/G/product_pricing/seed/all"
      healthEndpoint="/api/product_pricing/api/v1/G/product_pricing/health"
    />
  );
}
