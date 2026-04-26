 const getStatusClass = (qty) => {
    if (qty === 0) return "status-out";
    if (qty > 9 && qty < 20) return "status-low";
    if (qty > 0 && qty < 10) return "status-crit";
    return "status-in";
};

export default getStatusClass;