import { Character } from '../types';

export interface ValidationStep {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  steps: ValidationStep[];
  currentStep: number;
}

export class ScriptValidator {
  private text: string;
  private characters: Character[];
  private narratorVoiceId?: string;
  private focusedRole: string;

  constructor(
    text: string,
    characters: Character[],
    narratorVoiceId?: string,
    focusedRole: string = ''
  ) {
    this.text = text || '';
    this.characters = characters || [];
    this.narratorVoiceId = narratorVoiceId;
    this.focusedRole = focusedRole || '';
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    const steps: ValidationStep[] = [
      {
        id: 'script',
        label: 'Script Content',
        description: 'Check script format and content',
        isComplete: this.validateScript()
      },
      {
        id: 'characters',
        label: 'Character Detection',
        description: 'Verify character detection',
        isComplete: this.validateCharacters()
      },
      {
        id: 'role',
        label: 'Role Selection',
        description: 'Confirm role selection',
        isComplete: this.validateRole()
      },
      {
        id: 'voices',
        label: 'Voice Assignment',
        description: 'Check voice assignments',
        isComplete: this.validateVoices()
      }
    ];

    // Collect errors from each step
    if (!this.validateScript()) {
      errors.push('Invalid script format. Please check your script.');
      steps[0].error = 'Script is empty or has invalid format';
    }

    if (!this.validateCharacters()) {
      errors.push('No characters detected. Please add character dialog.');
      steps[1].error = 'No characters found in script';
    }

    if (!this.validateRole()) {
      errors.push('No role selected. Please choose your character.');
      steps[2].error = 'Select which character you want to play';
    }

    if (!this.validateVoices()) {
      errors.push('Missing voice assignments. Please assign voices to all characters.');
      steps[3].error = 'Assign voices to other characters';
    }

    // Find current step (first incomplete step)
    const currentStep = steps.findIndex(step => !step.isComplete);

    return {
      isValid: errors.length === 0,
      errors,
      steps,
      currentStep: currentStep === -1 ? steps.length - 1 : currentStep
    };
  }

  private validateScript(): boolean {
    try {
      // Handle null text cases
      if (!this.text) return false;
      
      const trimmedText = this.text.trim();
      if (!trimmedText) return false;

      // Any non-empty script is considered valid if we have characters already
      if (this.characters && this.characters.length > 0) {
        return true;
      }

      const lines = trimmedText.split('\n');
      let hasValidContent = false;
      let hasCharacterDialog = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check for valid content
        hasValidContent = true;

        // Check for character dialog (NAME: dialog)
        // Relaxed pattern to catch more variations of character dialog
        if (/^([A-Z][A-Za-z0-9\s\-']*?):\s*(.+)/.test(trimmed)) {
          hasCharacterDialog = true;
          break;
        }
      }

      return hasValidContent && (hasCharacterDialog || this.characters.length > 0);
    } catch (error) {
      console.error('Script validation error:', error);
      // If there's an error in validation, consider it valid if we have characters
      return this.characters.length > 0;
    }
  }

  private validateCharacters(): boolean {
    try {
      return Array.isArray(this.characters) && this.characters.length > 0;
    } catch (error) {
      console.error('Character validation error:', error);
      return false;
    }
  }

  private validateRole(): boolean {
    try {
      if (!this.focusedRole) return false;
      return this.characters.some(char => char.name === this.focusedRole);
    } catch (error) {
      console.error('Role validation error:', error);
      return false;
    }
  }

  private validateVoices(): boolean {
    try {
      // If we're not using voice mode, skip this validation
      if (!this.characters.some(char => char.voiceId)) {
        return true;
      }

      // Skip narrator voice validation if there's no explicit narration
      let needsNarratorVoice = false;
      try {
        needsNarratorVoice = this.text.split('\n').some(line => {
          const trimmed = line.trim();
          // Only consider substantial narration lines that don't look like headings
          return trimmed && trimmed.length > 10 && 
                 !trimmed.includes(':') && 
                 !/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT)/i.test(trimmed);
        });
      } catch (e) {
        needsNarratorVoice = false;
      }

      if (needsNarratorVoice && !this.narratorVoiceId) {
        return false;
      }

      // Check if all non-focused characters have voices
      // Only validate if voice mode is active (at least one character has a voice)
      const nonFocusedChars = this.characters.filter(char => 
        char.name !== this.focusedRole
      );
      
      // If no other characters need voices, we're good
      if (nonFocusedChars.length === 0) return true;
      
      // If any character has a voice, validate that all do
      const anyHasVoice = nonFocusedChars.some(char => char.voiceId);
      if (!anyHasVoice) return true;
      
      return nonFocusedChars.every(char => char.voiceId);
    } catch (error) {
      console.error('Voice validation error:', error);
      // Be lenient on voice validation errors
      return true;
    }
  }
}