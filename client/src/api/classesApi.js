
const API_URL = process.env.REACT_APP_API_URL

export const getClasses = async (affiliateId, date) => {
    try {
        const token = localStorage.getItem("token");

        if (!date || isNaN(new Date(date).getTime())) {
            console.error("❌ Invalid date received, using default today.");
            date = new Date(); // Kui pole saadetud, võta tänane
        } else {
            date = new Date(date);
        }

        // Arvutame nädala alguse ja lõpu (E → P)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);



        const response = await fetch(`${API_URL}/classes?affiliateId=${affiliateId}&start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching classes:", error);
    }
};


export const createTraining = async (affiliateId, trainingData) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/classes`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },
            body: JSON.stringify({
                affiliateId, // ✅ Lisa affiliateId
                trainingType: trainingData.trainingType || "", // ✅ Tagame, et väärtused ei ole undefined
                trainingName: trainingData.trainingName || "", // ✅ Tagame, et väärtused ei ole undefined
                duration: trainingData.duration || "",
                trainer: trainingData.trainer || "",
                memberCapacity: trainingData.memberCapacity || "",
                location: trainingData.location || "",
                repeatWeekly: trainingData.repeatWeekly || false,
                description: trainingData.description || "",
                time: trainingData.time || "",
                wodName: trainingData.wodName || "",
                wodType: trainingData.wodType || "",
            }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating training:", error);
    }
};

export const updateTraining = async (classId, trainingData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/classes/${classId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },
            body: JSON.stringify(trainingData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating training:", error);
    }
};

export const deleteClass = async (classId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/classes/${classId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete class");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error deleting class:", error);
    }
};

export const getClassAttendeesCount = async (classId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/attendees/${classId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`❌ Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.count || 0; // ✅ Tagastame registreeritud osalejate arvu või 0
    } catch (error) {
        console.error("❌ Error fetching class attendees:", error);
        return 0; // ✅ Kui tekib viga, tagastame 0
    }
};

export const getClassAttendees = async (classId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/class-attendees?classId=${classId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch class attendees");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching class attendees:", error);
    }
}


export const checkInAttendee = async (classId, userId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/class-attendees/check-in`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ classId, userId })
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Error checking in attendee:", error);
    }
};

export const deleteAttendee = async (classId, userId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/class-attendees`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ classId, userId })
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Error deleting attendee:", error);
    }
};

export const registerForClass = async (classId, planId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/classes/register`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                classId,
                planId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to register for class");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error registering for class:", error);
        throw error;
    }
};


export const cancelRegistration = async (classId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/classes/cancel`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                classId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to cancel registration");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error cancelling registration:", error);
        throw error;
    }
};

export const getUserPlans = async (affiliateId) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/plans?affiliateId=${affiliateId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to fetch user plans");
        }
        const data = await res.json();
        return data; // eeldame, et API tagastab massiivi kasutaja plaanidest
    } catch (error) {
        console.error("Error fetching user plans:", error);
        return [];
    }
};

export const checkUserEnrollment = async (classId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/class/check-enrollment?classId=${classId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Failed to check enrollment");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error checking enrollment:", error);
    }
}

export const getUserClassScore = async (classId) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/classes/leaderboard/check?classId=${classId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error("Failed to check user score");
        }
        return await res.json();
        // eeldame, et server tagastab: { hasScore: true/false, scoreType?: "...", score?: "..." }
    } catch (error) {
        console.error("Error checking user class score:", error);
        throw error;
    }
};

export const addClassScore = async (classId, scoreType, score) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/classes/leaderboard/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ classId, scoreType, score }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to add class score");
        }
        return await res.json();
    } catch (error) {
        console.error("Error adding class score:", error);
        throw error;
    }
};

export const updateClassScore = async (classId, scoreType, score) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/classes/leaderboard/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ classId, scoreType, score }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update class score");
        }
        return await res.json();
    } catch (error) {
        console.error("Error updating class score:", error);
        throw error;
    }
};