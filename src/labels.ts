/** Label represents a GitHub issue label. */
export interface Label {
    name: string;
    description?: string;
  }
  
  /** Labels are the VPAT related labels we'll add. */
  const labels: ReadonlyArray<Label> = [
    { name: "critical" },
    { name: "serious" },
    { name: "moderate" },
    { name: "minor" },
    { name: "production" },
    { name: "VPAT" },
    { name: "WCAG 1.1.1", description: "Non-text Content" },
    {
      name: "WCAG 1.2.1",
      description: "Audio-only and Video-only (Prerecorded)",
    },
    { name: "WCAG 1.2.2", description: "Captions (Prerecorded)" },
    {
      name: "WCAG 1.2.3",
      description: "Audio Description or Media Alternative (Prerecorded)",
    },
    { name: "WCAG 1.3.1", description: "Info and Relationships" },
    { name: "WCAG 1.3.2", description: "Meaningful Sequence" },
    { name: "WCAG 1.3.3", description: "Sensory Characteristics" },
    { name: "WCAG 1.4.1", description: "Use of Color" },
    { name: "WCAG 1.4.2", description: "Audio Control" },
    { name: "WCAG 2.1.1", description: "Keyboard" },
    { name: "WCAG 2.1.2", description: "No Keyboard Trap" },
    { name: "WCAG 2.1.4", description: "Character Key Shortcuts" },
    { name: "WCAG 2.2.1", description: "Timing Adjustable" },
    { name: "WCAG 2.2.2", description: "Pause, Stop, Hide" },
    { name: "WCAG 2.3.1", description: "Three Flashes or Below Threshold" },
    { name: "WCAG 2.4.1", description: "Bypass Blocks" },
    { name: "WCAG 2.4.2", description: "Page Titled" },
    { name: "WCAG 2.4.3", description: "Focus Order" },
    { name: "WCAG 2.4.4", description: "Link Purpose (In Context)" },
    { name: "WCAG 2.5.1", description: "Pointer Gestures" },
    { name: "WCAG 2.5.2", description: "Pointer Cancellation" },
    { name: "WCAG 2.5.3", description: "Label in Name" },
    { name: "WCAG 2.5.4", description: "Motion Actuation" },
    { name: "WCAG 3.1.1", description: "Language of Page" },
    { name: "WCAG 3.2.1", description: "On Focus" },
    { name: "WCAG 3.2.2", description: "On Input" },
    { name: "WCAG 3.3.1", description: "Error Identification" },
    { name: "WCAG 3.3.2", description: "Labels or Instructions" },
    { name: "WCAG 4.1.1", description: "Parsing" },
    { name: "WCAG 4.1.2", description: "Name, Role, Value" },
    { name: "WCAG 1.2.4", description: "Captions (Prerecorded)" },
    {
      name: "WCAG 1.2.5",
      description: "Audio Description or Media Alternative (Prerecorded)",
    },
    { name: "WCAG 1.3.4", description: "Orientation" },
    { name: "WCAG 1.3.5", description: "Identify Input Purpose" },
    { name: "WCAG 1.4.3", description: "Contrast (Minimum)" },
    { name: "WCAG 1.4.4", description: "Resize text" },
    { name: "WCAG 1.4.5", description: "Images of Text" },
    { name: "WCAG 1.4.10", description: "Reflow" },
    { name: "WCAG 1.4.11", description: "Non-text Contrast" },
    { name: "WCAG 1.4.12", description: "Text Spacing" },
    { name: "WCAG 1.4.13", description: "Content on Hover or Focus" },
    { name: "WCAG 2.4.5", description: "Multiple Ways" },
    { name: "WCAG 2.4.6", description: "Headings and Labels" },
    { name: "WCAG 2.4.7", description: "Focus Visible" },
    { name: "WCAG 3.1.2", description: "Language of Parts" },
    { name: "WCAG 3.2.3", description: "Consistent Navigation" },
    { name: "WCAG 3.2.4", description: "Consistent Identification" },
    { name: "WCAG 3.3.3", description: "Error Suggestion" },
    {
      name: "WCAG 3.3.4",
      description: "Error Prevention (Legal, Financial, Data)",
    },
    { name: "WCAG 4.1.3", description: "Status Messages" },
  ];
  
  export default labels;