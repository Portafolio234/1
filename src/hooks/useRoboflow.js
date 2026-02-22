import axios from 'axios';

const WORKFLOW_URL = "https://serverless.roboflow.com/detector-de-puertas/workflows/detect-count-and-visualize-10";
const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;

export const useRoboflow = () => {
    const findPredictions = (data) => {
        if (Array.isArray(data)) {
            for (const item of data) {
                const res = findPredictions(item);
                if (res) return res;
            }
        } else if (typeof data === 'object' && data !== null) {
            if (data.predictions && Array.isArray(data.predictions)) {
                return data.predictions;
            }
            for (const key in data) {
                const res = findPredictions(data[key]);
                if (res) return res;
            }
        }
        return null;
    };

    const analyzeZone = async (base64Image) => {
        try {
            const response = await axios.post(WORKFLOW_URL, {
                api_key: API_KEY,
                inputs: {
                    image: { type: "base64", value: base64Image }
                }
            });

            return findPredictions(response.data) || [];
        } catch (error) {
            console.error("Error en análisis de Roboflow:", error);
            throw error;
        }
    };

    return { analyzeZone };
};
