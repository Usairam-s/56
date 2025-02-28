import { Character } from '../types';

// Common words that should not be treated as character names
const EXCLUDE_WORDS = new Set([
  'INT', 'EXT', 'FADE', 'CUT', 'DISSOLVE', 'ANGLE', 'VIEW',
  'DAY', 'NIGHT', 'MORNING', 'EVENING', 'AFTERNOON',
  'CONTINUOUS', 'LATER', 'MOMENTS', 'SCENE', 'PAGE',
  'SUPER', 'TITLE', 'ESTABLISHING', 'FLASHBACK', 'END',
  'MONTAGE', 'INTERCUT', 'BACK', 'FRONT', 'TOP', 'BOTTOM',
  'START', 'CONTINUED', 'CONT\'D', 'OFF', 'DRAFT', 'REVISION'
]);

// Max line length before wrapping (for teleprompter readability)
const MAX_LINE_LENGTH = 80;

// Format text specifically for teleprompter reading
export const formatForTeleprompter = (text: string): string => {
  if (!text) return '';

  // Standard screenplay formatting constants
  const CHAR_MARGIN = 40;      // Character name margin from left (4.2 inches)
  const DIALOG_MARGIN = 25;    // Dialog margin from left (2.9 inches)
  const PAREN_MARGIN = 30;     // Parenthetical margin from left (3.1 inches)
  const ACTION_MARGIN = 15;    // Action/description margin from left (1.5 inches)
  const SCENE_MARGIN = 15;     // Scene heading margin from left (1.5 inches)
  const PAGE_WIDTH = 60;       // Standard page width in characters

  // Clean up text and normalize line endings
  const cleanText = text
    .replace(/\r\n|\r/g, '\n')  // Normalize line endings
    .replace(/\t/g, '    ')     // Convert tabs to spaces
    .replace(/[ \t]+$/gm, '')   // Remove trailing whitespace
    .replace(/\s*\(\s*/g, '(')  // Normalize parentheses spacing
    .replace(/\s*\)\s*/g, ')')  // Normalize parentheses spacing
    .replace(/([A-Z][A-Z\s]+)(?:\s+)([A-Z][A-Z\s]+):/g, '$1 $2:') // Fix split character names
    .replace(/\s*\(CONT'D\)\s*/gi, '') // Remove CONT'D markers
    .replace(/\s+/g, ' ')      // Normalize spaces
    .trim();
  
  const lines = cleanText.split('\n');
  const formattedLines: string[] = [];
  let inDialog = false;
  
  // Remove metadata lines at start
  let startIndex = 0;
  while (startIndex < lines.length && (
    lines[startIndex].trim().match(/^(last updated|gpt|side|copyright|draft|page|fade in)/i) ||
    !lines[startIndex].trim()
  )) {
    startIndex++;
  }

  for (let i = startIndex; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines but preserve spacing between content
    if (!line) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    // Remove "START" and "END" markers
    if (line.match(/^(START|END)$/i)) {
      continue;
    }

    // Handle scene headings (INT./EXT.)
    if (/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT|INTERIOR|EXTERIOR)/i.test(line)) {
      // Add spacing around scene headings
      if (formattedLines.length > 0) {
        formattedLines.push('');
      }
      
      // Format scene heading
      let heading = line.toUpperCase()
        .replace(/\s*-\s*/g, ' - ')  // Standardize all dashes
        .replace(/\s+/g, ' ')        // Normalize spaces 
        .replace(/\.$/, '')          // Remove trailing period
        .trim();
      
      // Add proper margin
      heading = ' '.repeat(SCENE_MARGIN) + heading.padEnd(PAGE_WIDTH - SCENE_MARGIN);
      
      // Wrap if too long
      if (heading.length > PAGE_WIDTH) {
        const wrapped = heading.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(heading);
      }
      
      formattedLines.push('');
      
      inDialog = false;
      continue;
    }

    // Handle character names
    if (isCharacterName(line, lines[i + 1])) {
      // Clean up character name
      const charName = line
        .replace(/^([A-Z][A-Z\s\-']*?)[\s]*(\(.*?\))?[\s]*:?$/, '$1')
        .toUpperCase()
        .replace(/\s+/g, ' ')  // Normalize spaces
        .trim();
      
      // Add spacing before character name
      if (formattedLines.length > 0) {
        formattedLines.push('');
      }
      
      // Center character name (standard screenplay format)
      const nameLength = charName.length;
      const totalPadding = PAGE_WIDTH - nameLength;
      const leftPadding = Math.floor(totalPadding / 2) + CHAR_MARGIN;
      const formattedName = ' '.repeat(leftPadding) + charName;
      formattedLines.push(formattedName);
      
      inDialog = true;
      continue;
    }

    // Handle parentheticals
    if (/^\(.*\)$/.test(line)) {
      // Format parenthetical
      let cleanParenthetical = line
        .slice(1, -1)  // Remove outer parentheses
        .trim()        // Remove extra spaces
        .replace(/\s+/g, ' ');  // Normalize spaces
      
      // Indent parenthetical
      const parenText = `(${cleanParenthetical})`;
      const parenPadding = Math.floor((PAGE_WIDTH - parenText.length) / 2) + PAREN_MARGIN;
      cleanParenthetical = ' '.repeat(parenPadding) + parenText;
      
      // Wrap if too long
      if (cleanParenthetical.length > PAGE_WIDTH) {
        const wrapped = cleanParenthetical.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(cleanParenthetical);
      }
      
      continue;
    }

    // Handle dialog
    if (inDialog) {
      // Indent dialog
      const dialogText = line.trim();
      const dialogPadding = Math.floor((PAGE_WIDTH - dialogText.length) / 2) + DIALOG_MARGIN;
      let dialog = ' '.repeat(dialogPadding) + dialogText;
      
      // Wrap dialog if too long
      if (dialog.length > PAGE_WIDTH) {
        const wrapped = dialog.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(dialog);
      }
      
      continue;
    }

    // Handle action/description
    let action = ' '.repeat(ACTION_MARGIN) + line.trim().padEnd(PAGE_WIDTH - ACTION_MARGIN);
    
    // Wrap action if too long
    if (action.length > PAGE_WIDTH) {
      const wrapped = action.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
      formattedLines.push(...wrapped.map(line => line.trimRight()));
    } else {
      formattedLines.push(action);
    }
  }

  // Clean up the final text
  let result = formattedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Max two blank lines
    .replace(/[ \t]+$/gm, '')    // Remove trailing whitespace
    .trim();
  
  // Add final newline
  return result + '\n';
};

// Standard screenplay formatting
export const formatScript = (text: string): string => {
  if (!text) return '';
  
  // Standard screenplay formatting constants
  const CHAR_MARGIN = 50;      // Character name margin from left (4.2 inches)
  const DIALOG_MARGIN = 35;    // Dialog margin from left (2.9 inches)
  const PAREN_MARGIN = 37;     // Parenthetical margin from left (3.1 inches)
  const ACTION_MARGIN = 18;    // Action/description margin from left (1.5 inches)
  const SCENE_MARGIN = 18;     // Scene heading margin from left (1.5 inches)
  const PAGE_WIDTH = 90;       // Standard page width in characters
  
  // Clean up text and normalize line endings
  const cleanText = text
    .replace(/\r\n|\r/g, '\n')  // Normalize line endings
    .replace(/\t/g, '    ')     // Convert tabs to spaces
    .replace(/[ \t]+$/gm, '')   // Remove trailing whitespace
    .replace(/\s*\(\s*/g, '(')  // Normalize parentheses spacing
    .replace(/\s*\)\s*/g, ')')  // Normalize parentheses spacing
    .trim();

  const lines = cleanText.split('\n');
  let formattedLines: string[] = [];
  let inDialog = false;
  let hasSeenContent = false;

  // Remove metadata lines at start
  let startIndex = 0;
  while (startIndex < lines.length && (
    lines[startIndex].trim().match(/^(last updated|gpt|side|copyright|draft|page|fade in)/i) ||
    !lines[startIndex].trim()
  )) {
    startIndex++;
  }

  for (let i = startIndex; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines but preserve spacing between content
    if (!line) {
      if (hasSeenContent && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }
    
    hasSeenContent = true;

    // Remove "START" and "END" markers
    if (line.match(/^(START|END)$/i)) {
      continue;
    }

    // Handle scene headings (INT./EXT.)
    if (/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT|INTERIOR|EXTERIOR)/i.test(line)) {
      // Add spacing around scene headings
      if (formattedLines.length > 0) {
        formattedLines.push('');
      }
      
      // Format scene heading
      let heading = line.toUpperCase()
        .replace(/\s*-\s*/g, ' - ')  // Standardize all dashes
        .replace(/\s+/g, ' ')        // Normalize spaces 
        .replace(/\.$/, '')          // Remove trailing period
        .trim();
      
      // Add proper margin
      heading = ' '.repeat(SCENE_MARGIN) + heading.padEnd(PAGE_WIDTH - SCENE_MARGIN);
      
      // Wrap if too long
      if (heading.length > PAGE_WIDTH) {
        const wrapped = heading.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(heading);
      }
      
      formattedLines.push('');
      inDialog = false;
      continue;
    }

    // Handle character names
    if (isCharacterName(line, lines[i + 1])) {
      // Clean up character name
      let charName = line
        .replace(/^([A-Z][A-Z\s\-']*?)[\s]*(\(.*?\))?[\s]*:?$/, '$1')
        .toUpperCase()
        .replace(/^(INT|EXT|I\/E)(\.|\s)/i, 'INT. ')  // Standardize INT./EXT.
        .trim();
      
      // Add spacing before character name
      if (formattedLines.length > 0) {
        formattedLines.push('');
      }
      
      // Center character name (standard screenplay format)
      const nameLength = charName.length;
      const totalPadding = PAGE_WIDTH - nameLength;
      const leftPadding = Math.floor(totalPadding / 2) + 20;
      charName = ' '.repeat(leftPadding) + charName + ':';
      formattedLines.push(charName);
      
      inDialog = true;
      continue;
    }

    // Handle parentheticals
    if (/^\(.*\)$/.test(line)) {
      // Format parenthetical
      let cleanParenthetical = line
        .slice(1, -1)  // Remove outer parentheses
        .trim()        // Remove extra spaces
        .replace(/\s+/g, ' ');  // Normalize spaces
      
      // Indent parenthetical
      const parenText = `(${cleanParenthetical})`;
      const parenPadding = Math.floor((PAGE_WIDTH - parenText.length) / 2) + 15;
      cleanParenthetical = ' '.repeat(parenPadding) + parenText;
      
      // Wrap if too long
      if (cleanParenthetical.length > PAGE_WIDTH) {
        const wrapped = cleanParenthetical.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(cleanParenthetical);
      }
      
      continue;
    }

    // Handle dialog
    if (inDialog) {
      // Indent dialog
      const dialogText = line.trim();
      const dialogPadding = Math.floor((PAGE_WIDTH - dialogText.length) / 2) + 20;
      let dialog = ' '.repeat(dialogPadding) + dialogText;
      
      // Wrap dialog if too long
      if (dialog.length > PAGE_WIDTH) {
        const wrapped = dialog.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
        formattedLines.push(...wrapped.map(line => line.trimRight()));
      } else {
        formattedLines.push(dialog);
      }
      
      continue;
    }

    // Handle action/description
    let action = ' '.repeat(ACTION_MARGIN) + line.trim().padEnd(PAGE_WIDTH - ACTION_MARGIN);
    
    // Wrap action if too long
    if (action.length > PAGE_WIDTH) {
      const wrapped = action.match(new RegExp(`.{1,${PAGE_WIDTH}}`, 'g')) || [];
      formattedLines.push(...wrapped.map(line => line.trimRight()));
    } else {
      formattedLines.push(action);
    }
  }

  // Clean up the final text
  let result = formattedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Max two blank lines
    .replace(/[ \t]+$/gm, '')    // Remove trailing whitespace
    .trim();
  
  // Add final newline
  return result + '\n';
};

// Format for PDF export
export const formatForPDF = (text: string, formatType: 'standard' | 'teleprompter' = 'standard'): string => {
  return formatType === 'teleprompter' ? formatForTeleprompter(text) : formatScript(text);
};

// Detect if a line is a character name
const isCharacterName = (line: string, nextLine?: string): boolean => {
  if (!line) return false;

  // Remove any existing colon and parentheticals
  line = line
    .replace(/:$/, '')
    .replace(/\s*\(.*\)$/, '')
    .replace(/\s*\(CONT'D\)$/i, '')
    .trim()
    .toUpperCase();

  // Skip if line is empty after cleaning
  if (!line) return false;

  // Skip if line is in exclude words
  if (EXCLUDE_WORDS.has(line)) return false;

  // Skip if line is too long to be a name
  if (line.length > 50) return false;

  // Check if line matches character name patterns:
  // 1. All caps with optional parenthetical
  // 2. Followed by dialog on next line
  // 3. Contains only letters, numbers, spaces, and hyphens
  const isValidFormat = /^[A-Z][A-Z0-9\s\-'.]*$/.test(line);
  const hasNextLineDialog = nextLine && nextLine.trim() && 
                           !/^[A-Z\s]+$/.test(nextLine.trim()) &&
                           !/^(INT\.|EXT\.|I\/E)/i.test(nextLine.trim());
  
  return isValidFormat && hasNextLineDialog;
};

// Extract characters from formatted script
export const extractCharacters = (text: string): string[] => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const characters = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Look for character name patterns (NAME: dialog)
    const match = line.match(/^([A-Z][A-Z0-9\s\-'.]*?):\s*(.+)?$/);
    if (match) {
      const name = match[1].trim();
      if (!EXCLUDE_WORDS.has(name)) {
        characters.add(name);
      }
    }
    // Also check for character names without dialog yet
    else if (isCharacterName(line, lines[i + 1])) {
      const name = line
        .replace(/\s*\(.*\)$/, '')
        .replace(/:$/, '')
        .trim()
        .toUpperCase();
      if (!EXCLUDE_WORDS.has(name)) {
        characters.add(name);
      }
    }
  }

  return Array.from(characters).sort();
};

// Get script title from content
export const extractScriptTitle = (text: string): string => {
  if (!text) return 'Untitled Script';
  
  const lines = text.split('\n');
  
  // Look for a title at the beginning (first 10 non-empty lines)
  let nonEmptyCount = 0;
  for (let i = 0; i < lines.length && nonEmptyCount < 10; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    nonEmptyCount++;
    
    // Check if line looks like a title
    if (/title(:|\s-)\s*(.*)/i.test(line)) {
      const match = line.match(/title(:|\s-)\s*(.*)/i);
      if (match && match[2]?.trim()) {
        return match[2].trim();
      }
    }
    
    // Check for a standalone ALL CAPS line that could be a title
    if (/^[A-Z0-9\s&'!,.:-]+$/.test(line) && 
        line.length > 3 && line.length < 60 &&
        !line.startsWith('INT') && 
        !line.startsWith('EXT') &&
        !EXCLUDE_WORDS.has(line)) {
      return line;
    }
  }
  
  // If no title found, look for the first scene heading
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^(INT\.|EXT\.)/i.test(line)) {
      // Extract location from scene heading
      const location = line.replace(/^(INT\.|EXT\.|I\/E)\.?\s*/, '')
                           .split('-')[0]
                           .trim();
      if (location) {
        return `Script - ${location}`;
      }
      break;
    }
  }
  
  // Default title with timestamp
  return `Script - ${new Date().toLocaleDateString()}`;
};