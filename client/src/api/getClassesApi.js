const API_URL = process.env.REACT_APP_API_URL


export const fetchAffiliates = async (query) => {

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/search-affiliates?q=${query}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    return response.ok ? response.json() : [];
};

export const fetchAffiliateInfo = async (affiliateId) => {

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/get-affiliate-by-id?id=${affiliateId}`,
        {   method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    return response.ok ? response.json() : null;
};

export const addHomeAffiliate = async (affiliateId) => {

    const token = localStorage.getItem("token");
    return await fetch(`${API_URL}/add-home-affiliate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId }),
    });
};

export const removeHomeAffiliate = async (affiliateId) => {

    const token = localStorage.getItem("token");
    return await fetch(`${API_URL}/remove-home-affiliate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId }),
    });
};

export const fetchPlans = async (ownerId) => {

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/affiliate-plans?ownerId=${ownerId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });


    return response.json();
};

export const checkHomeAffiliate = async () => {

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/user-home-affiliate`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    if (response.ok) {
        const data = await response.json();
        return data.homeAffiliate || null;
    }
    return null;
};
