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

export const getUserOrder = async () => {
    const response = await fetch(`${baseUrl}/user/order`, {
        method: 'GET',
        headers: headers()
    });
    if (!response.ok) {
        if (response.status === 404) {
            return [];
        }
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

    // Append simple text fields
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

    // Build gallery metadata and file map
    const galleryMeta = [];
    const galleryFileMap = {};

    if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((item, index) => {
            galleryMeta.push({
                title: item.title,
                shortDesc: item.shortDesc,
                imagePath: item.imagePath || ''
            });

            // If this item has a new file (File object), append it
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
        // 1. Construct URL with query parameters
        const endpoint = "/admin/order/getReportByRange";
        const params = new URLSearchParams({ startDate, endDate });
        const url = `${endpoint}?${params.toString()}`;
        // 2. Fetch with Authorization headers
        const response = await fetch(`${baseUrl}${url}`, {
            method: 'GET',
            headers: {
                // Replace with however you store your admin token
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download report');
        }

        // 3. Convert response to a Blob (Binary Large Object)
        const blob = await response.blob();

        // 4. Create a temporary URL for the Blob
        const downloadUrl = window.URL.createObjectURL(blob);

        // 5. Create a hidden <a> tag to trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Set the file name (matches what we did in the backend)
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `Order_Report_${dateStr}.xlsx`);

        // Append, click, and remove
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        // 6. Clean up the URL object to free up memory
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("Export Error:", error);
        // You can trigger your custom Swal.fire error here!
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
