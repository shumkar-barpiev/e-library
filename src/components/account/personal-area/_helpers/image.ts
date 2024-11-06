export const base64ToBlobUrl = (base64String: string, mimeType: string) => {
  const base64Content = getBase64Content(base64String);
  if (!base64Content) {
    const defaultProfileImage = `${process.env.NODE_ENV === "production" ? "/foms/front/" : "/"}assets/noProfileImage.jpg`;

    return defaultProfileImage;
  } else {
    const byteCharacters = atob(`${base64Content}`);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: mimeType });

    return URL.createObjectURL(blob);
  }
};

function getBase64Content(base64String: string) {
  if (base64String.startsWith("data:")) {
    const base64Content = base64String.split(",")[1];
    return base64Content;
  }
  return null;
}
