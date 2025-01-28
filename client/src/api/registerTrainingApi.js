const API_BASE = process.env.REACT_APP_API_URL

export const fetchAffiliates = async (query) => {
    const response = await fetch(`${API_BASE}/api/search-affiliates?q=${query}`);
    return response.ok ? response.json() : [];
};

export const fetchAffiliateInfo = async (affiliateId) => {
    const response = await fetch(`${API_BASE}/api/get-affiliate-by-id?id=${affiliateId}`);
    return response.ok ? response.json() : null;
};

export const addHomeAffiliate = async (affiliateId) => {
    return await fetch("${API_BASE}/api/add-home-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId }),
    });
};

export const removeHomeAffiliate = async (affiliateId) => {
    return await fetch("${API_BASE}/api/remove-home-affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId }),
    });
};

export const fetchPlans = async (affiliateId) => {
    const response = await fetch(`${API_BASE}/api/plans?ownerId=${affiliateId}`);
    return response.ok ? response.json() : [];
};
