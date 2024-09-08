export const compareArrays = (array1, array2) => {
  if (array1.length != array2.length) return false;
  array1 = array1.sort();
  // updateGenres almacena un boolean esta haciendo una comparacion si los genres de new movie son iguales a los genres old movie
  return array2.sort().every((genre, index) => genre === array1[index]);
};
