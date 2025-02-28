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
    // Handle null text cases
    if (!this.text) return false;
    
    const trimmedText = this.text.trim();
    if (!trimmedText) return false;

    const lines = trimmedText.split('\n');
    let hasValidContent = false;
    let hasCharacterDialog = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for valid content
      hasValidContent = true;

      // Check for character dialog (NAME: dialog)
      if (/^[A-Z][A-Z0-9\s\-']*?:\s*.+/.test(trimmed)) {
        hasCharacterDialog = true;
        break;
      }
    }

    return hasValidContent && hasCharacterDialog;
  }

  private validateCharacters(): boolean {
    return Array.isArray(this.characters) && this.characters.length > 0;
  }

  private validateRole(): boolean {
    if (!this.focusedRole) return false;
    return this.characters.some(char => char.name === this.focusedRole);
  }

  private validateVoices(): boolean {
    // Skip voice validation if no narrator voice is needed
    const needsNarratorVoice = this.text.split('\n').some(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.includes(':') && !/^(INT\.|EXT\.)/.test(trimmed);
    });

    if (needsNarratorVoice && !this.narratorVoiceId) {
      return false;
    }

    // Check if all non-focused characters have voices
    return this.characters.every(char => 
      char.name === this.focusedRole || char.voiceId
    );
  }

  getNextStep(): string {
    if (!this.validateScript()) {
      return 'Please check your script format';
    }
    if (!this.validateCharacters()) {
      return 'Add character dialog to your script';
    }
    if (!this.validateRole()) {
      return 'Select which character you want to read';
    }
    if (!this.validateVoices()) {
      return 'Assign voices to the other characters';
    }
    return 'Ready to start';
  }
}