export default function getAuthHeaders(baseHeaders = {}) {
  const token = localStorage.getItem("token");
  return {
    ...baseHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

