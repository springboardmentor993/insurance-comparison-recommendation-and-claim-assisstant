import { useState, useEffect } from 'react';

export const useFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, dependencies);

    return { data, loading, error, refetch };
};

export default useFetch;
