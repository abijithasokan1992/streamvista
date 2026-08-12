export default function handler(_request,response){response.setHeader("cache-control","no-store");return response.status(200).json({status:"ok",service:"streamvista"});}
