const express = require("express");
const router = express.Router();

// ✅ Impordi Affiliate Controller
const affiliateController = require("../controllers/affiliateController");

// ✅ Impordi JWT autentimise middleware
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");

// ✅ Kontrolli, kas kõik vajalikud funktsioonid on olemas
if (!affiliateController.getMyAffiliate || !affiliateController.createOrUpdateAffiliate || !affiliateController.searchUsers) {
    console.error("❌ ERROR: One or more controller functions are missing!");
    process.exit(1); // Peatab serveri käivitamise, kui midagi on puudu
}

// ✅ Defineeri API teed (routes)
router.get("/my-affiliate", ensureAuthenticated, affiliateController.getMyAffiliate);
router.get("/search-users", ensureAuthenticated, affiliateController.searchUsers);
router.put("/affiliate", ensureAuthenticated, affiliateController.createOrUpdateAffiliate);

module.exports = router;
