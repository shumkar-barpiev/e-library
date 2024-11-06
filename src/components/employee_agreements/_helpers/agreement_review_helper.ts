export const scrollIntoElement = (elementId: string) => {
  setTimeout(() => {
    const element = document.getElementById(`${elementId}`);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
};

export const bytesToBase64 = (bytes: Uint8Array) => {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
};

export const convertBase64ToBlob = async (base64: string) => {
  const response = await fetch(`data:application/pdf;base64,${base64}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
