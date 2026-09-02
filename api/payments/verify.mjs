import verifyMarketplacePayment from "../payment/verify.mjs";
import verifyPlanPayment from "../payment/verify-plan-payment.mjs";

export default async function handler(request, response) {
  const onboardingId = String(request.body?.onboardingId || "").trim();
  if (!onboardingId && request.body && typeof request.body === "object") {
    request.body.razorpay_order_id ||= request.body.orderId;
    request.body.razorpay_payment_id ||= request.body.paymentId;
    request.body.razorpay_signature ||= request.body.signature;
  }
  return onboardingId ? verifyPlanPayment(request, response) : verifyMarketplacePayment(request, response);
}
