export default async (casNumber: string | undefined) => {
  if (!casNumber) {
    return null;
  }
  try {
    const responce = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${casNumber}/stdinchikey`);
    if (!responce.ok) {
      throw new Error();
    }
    const inChiKeyString = await responce.text();
    return inChiKeyString.split('=')[1];
  } catch (error) {
    return null;
  }
}