export const validateScript = (text: string) => {
  const errors: string[] = [];
  
  if (!text.trim()) {
    errors.push('Script content cannot be empty');
  }
  
  if (text.length > 50000) {
    errors.push('Script is too long (maximum 50,000 characters)');
  }
  
  const lines = text.split('\n');
  const invalidLines = lines.filter(line => line.length > 500);
  
  if (invalidLines.length > 0) {
    errors.push('Some lines are too long (maximum 500 characters per line)');
  }
  
  return errors;
};

export const validateCharacterName = (name: string) => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Character name cannot be empty');
  }
  
  if (name.length > 50) {
    errors.push('Character name is too long (maximum 50 characters)');
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    errors.push('Character name can only contain letters, numbers, spaces, and hyphens');
  }
  
  return errors;
};

export const validateScriptTitle = (title: string) => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Script title cannot be empty');
  }
  
  if (title.length > 100) {
    errors.push('Script title is too long (maximum 100 characters)');
  }
  
  if (!/^[a-zA-Z0-9\s-_]+$/.test(title)) {
    errors.push('Script title can only contain letters, numbers, spaces, hyphens, and underscores');
  }
  
  return errors;
};