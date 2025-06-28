exports.generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4-char alphanumeric
  return `TRK-${timestamp}-${random}`;
};
