import createMarketplaceOrder from "../payment/create-order.mjs";
import createPlanOrder from "../payment/create-plan-order.mjs";

export default async function handler(request, response) {
  const cycle = String(request.body?.cycle || "").trim();
  return cycle ? createPlanOrder(request, response) : createMarketplaceOrder(request, response);
}
