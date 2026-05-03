// const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// export default BASE_URL;

const BASE_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
export default BASE_URL;