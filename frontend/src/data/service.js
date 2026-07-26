import { Toast } from '../utils/Toast';
const headers = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
    };
}


const baseUrl = import.meta.env.VITE_API_URL;

export const addProduct = async (formData) => {
    const response = await fetch(`${baseUrl}/admin/product/add`, {
        method: 'POST',
        body: formData,
        headers: headers()
    });
    return response;
}
export const addCoupon = async (formData) => {
    const response = await fetch(`${baseUrl}/admin/coupon/add`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}
export const updateProduct = async (formData) => {
    const response = await fetch(`${baseUrl}/admin/product/update`, {
        method: 'PUT',
        body: formData,
        headers: headers()
    });
    return response;
}

export const deleteProduct = async (id) => {
    const response = await fetch(`${baseUrl}/admin/product/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ id: id }),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;

}
export const deleteCoupon = async (id) => {
    const response = await fetch(`${baseUrl}/admin/coupon/delete/${id}`, {
        method: 'DELETE',
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;

}

export const addCategory = async ({ name }) => {
    const response = await fetch(`${baseUrl}/admin/cat/add`, {
        method: 'POST',
        body: JSON.stringify({ name: name }),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const getOrders = async () => {
    const response = await fetch(`${baseUrl}/admin/order/get`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

/**
 * Fetch only ongoing (processing) orders — small dataset, no pagination needed.
 */
export const getOngoingOrders = async () => {
    const response = await fetch(`${baseUrl}/admin/order/get?status=processing`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return [];
    }
    const data = await response.json();
    return data;
}

/**
 * Fetch paginated order history (completed + cancelled).
 * @param {object} params - { page, limit, startDate, endDate, type, status }
 * @returns {{ data, total, page, totalPages, limit }}
 */
export const getOrderHistory = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.status && params.status !== 'all') query.set('status', params.status);

    const response = await fetch(`${baseUrl}/admin/order/history?${query.toString()}`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get order history',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return { data: [], total: 0, page: 1, totalPages: 0, limit: 20 };
    }
    return await response.json();
}

/**
 * Fetch aggregated dashboard stats (no individual order documents).
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string} endDate   - ISO date string (YYYY-MM-DD)
 * @returns {{ stats, salesData, topProducts }}
 */
export const getOrderStats = async (startDate, endDate) => {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);

    const response = await fetch(`${baseUrl}/admin/order/stats?${query.toString()}`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get dashboard stats',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return { stats: { totalIncome: 0, totalDiscount: 0, totalOrdersCount: 0 }, salesData: [], topProducts: [] };
    }
    return await response.json();
}

export const getUserStat = async (date) => {
    const response = await fetch(`${baseUrl}/admin/user/getStat`, {
        method: 'POST',
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(date)
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const getUserList = async () => {
    const response = await fetch(`${baseUrl}/admin/user/get`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const getProfile = async () => {
    const response = await fetch(`${baseUrl}/user/profile`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

/**
 * Fetch paginated user orders.
 * @param {number} page
 * @param {number} limit
 * @returns {{ data, total, page, totalPages, limit }}
 */
export const getUserOrder = async (page = 1, limit = 10) => {
    const query = new URLSearchParams({ page, limit });
    const response = await fetch(`${baseUrl}/user/order?${query.toString()}`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        if (response.status === 404) {
            return { data: [], total: 0, page: 1, totalPages: 0, limit };
        }
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
    return await response.json();
}

export const getDataFromQR = async (link) => {
    const response = await fetch(link, {
        method: 'GET'
    })
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const updateCoupon = async (id, formData) => {
    const response = await fetch(`${baseUrl}/admin/coupon/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const getAvailableCouponsByUser = async (userId) => {
    const response = await fetch(`${baseUrl}/admin/coupon/getByUser/${userId}`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get coupon data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const createOrder = async (orderData) => {
    const response = await fetch(`${baseUrl}/admin/order/add`, {
        method: 'POST',
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    return response;
}

export const completeStatus = async (idOrder, status) => {
    const response = await fetch(`${baseUrl}/admin/order/update/${idOrder}/status`, {
        method: 'PATCH',
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status })
    });
    return response;
}

export const getAllCoupon = async () => {
    const response = await fetch(`${baseUrl}/admin/coupon/get`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}
export const getAvailableCoupon = async () => {
    const response = await fetch(`${baseUrl}/admin/coupon/getAvailable`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const AssignCoupon = async (data) => {
    const response = await fetch(`${baseUrl}/admin/coupon/assign`, {
        method: 'POST',
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response;
}

export const getOrderDetail = async (id) => {
    const response = await fetch(`${baseUrl}/admin/order/get/${id}`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const resData = await response.json();
    return resData;
}

export const getWebInformation = async () => {
    const response = await fetch(`${baseUrl}/admin/web-info`, {
        method: 'GET',
        headers: headers()
    });
    const data = await response.json();
    return data;
}

export const updateWebInformation = async (data) => {
    const freshToken = localStorage.getItem("token");
    const formData = new FormData();

    
    formData.append('mainTitle', data.mainTitle);
    formData.append('shortDesc', data.shortDesc);
    formData.append('longDesc', data.longDesc);
    formData.append('motto1', data.motto1);
    formData.append('motto2', data.motto2);
    formData.append('motto3', data.motto3);
    formData.append('address', data.address);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('establishedYear', data.establishedYear);
    formData.append('mapsLink', data.mapsLink);
    formData.append('openingHours', JSON.stringify(data.openingHours));

    
    const galleryMeta = [];
    const galleryFileMap = {};

    if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((item, index) => {
            galleryMeta.push({
                title: item.title,
                shortDesc: item.shortDesc,
                imagePath: item.imagePath || ''
            });

            
            if (item.file instanceof File) {
                formData.append('galleryImages', item.file);
                galleryFileMap[String(index)] = true;
            }
        });
    }

    formData.append('gallery', JSON.stringify(galleryMeta));
    formData.append('galleryFileMap', JSON.stringify(galleryFileMap));

    const response = await fetch(`${baseUrl}/admin/web-info/update`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${freshToken}`,
        },
        body: formData
    });
    return response;
}

export const getOwnCoupon = async () => {
    const response = await fetch(`${baseUrl}/user/coupon/get`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const getQr = async () => {
    const response = await fetch(`${baseUrl}/qr/`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}

export const updateProfile = async (formData) => {
    const response = await fetch(`${baseUrl}/user/profile/update`, {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export const handleExportExcel = async (startDate, endDate) => {
    try {
        
        const endpoint = "/admin/order/getReportByRange";
        const params = new URLSearchParams({ startDate, endDate });
        const url = `${endpoint}?${params.toString()}`;
        
        const response = await fetch(`${baseUrl}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download report');
        }

        
        const blob = await response.blob();

        
        const downloadUrl = window.URL.createObjectURL(blob);

        
        const link = document.createElement('a');
        link.href = downloadUrl;

        
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `Order_Report_${dateStr}.xlsx`);

        
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("Export Error:", error);
        
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: error.message || 'Failed to download report',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
};

export const getOrderByRange = async (startDate, endDate) => {
    const response = await fetch(`${baseUrl}/admin/order/getByRange`, {
        method: 'PUT',
        body: JSON.stringify({ startDate, endDate }),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    })
    return response;

}

export const getDailyStats = async () => {
    const response = await fetch(`${baseUrl}/admin/order/getDailyStats`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get data',
            background: '#fff1f2',
            color: '#9f1239'
        });
    }
    const data = await response.json();
    return data;
}



export const getMaterials = async () => {
    const response = await fetch(`${baseUrl}/admin/material/`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get materials',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return [];
    }
    const data = await response.json();
    return data;
}

export const getMaterialHistory = async () => {
    const response = await fetch(`${baseUrl}/admin/material/history`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        Toast.fire({
            icon: 'error',
            iconColor: '#f43f5e',
            title: 'Failed get material history',
            background: '#fff1f2',
            color: '#9f1239'
        });
        return [];
    }
    const data = await response.json();
    return data;
}

export const addMaterial = async (formData) => {
    const response = await fetch(`${baseUrl}/admin/material/add`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const updateMaterial = async (formData) => {
    const response = await fetch(`${baseUrl}/admin/material/update`, {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const deleteMaterial = async (id) => {
    const response = await fetch(`${baseUrl}/admin/material/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: {
            ...headers(),
            'Content-Type': 'application/json'
        }
    });
    return response;
}
