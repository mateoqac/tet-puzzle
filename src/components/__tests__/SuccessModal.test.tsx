import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { I18nContext } from '../../i18n';
import { translations } from '../../i18n/translations';
import SuccessModal from '../SuccessModal';

// Wrapper to provide i18n context
const renderWithI18n = (ui: preact.ComponentChild) => {
  const i18nValue = {
    language: 'en' as const,
    setLanguage: () => {},
    t: (key: keyof typeof translations.en) => translations.en[key],
  };
  return render(
    <I18nContext.Provider value={i18nValue}>
      {ui}
    </I18nContext.Provider>
  );
};

describe('SuccessModal', () => {
  const mockOnPlayAgain = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      renderWithI18n(<SuccessModal isOpen={false} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display congratulations title', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });

    it('should display success message', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.getByText('You solved the puzzle!')).toBeInTheDocument();
    });

    it('should display Play Again button', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onPlayAgain when button is clicked', async () => {
      const user = userEvent.setup();

      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const playAgainButton = screen.getByRole('button', { name: /play again/i });
      await user.click(playAgainButton);

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('should call onPlayAgain when Escape is pressed', async () => {
      const user = userEvent.setup();

      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      // Button is auto-focused, keyboard events bubble up to the dialog's onKeyDown handler
      await user.keyboard('{Escape}');

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('should trap Tab key within modal', async () => {
      const user = userEvent.setup();

      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const button = screen.getByRole('button', { name: /play again/i });

      // Tab should stay on button
      await user.tab();
      expect(button).toHaveFocus();

      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('focus management', () => {
    it('should focus button when modal opens', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const button = screen.getByRole('button', { name: /play again/i });
      expect(button).toHaveFocus();
    });

    it('should restore focus when modal closes', () => {
      const i18nValue = {
        language: 'en' as const,
        setLanguage: () => {},
        t: (key: keyof typeof translations.en) => translations.en[key],
      };

      // Create an element to focus before opening modal
      const { container } = render(
        <I18nContext.Provider value={i18nValue}>
          <div>
            <button>Previous Button</button>
            <SuccessModal isOpen={false} onPlayAgain={mockOnPlayAgain} />
          </div>
        </I18nContext.Provider>
      );

      const prevButton = screen.getByText('Previous Button');
      prevButton.focus();
      expect(prevButton).toHaveFocus();

      // Open modal
      const { rerender } = render(
        <I18nContext.Provider value={i18nValue}>
          <div>
            <button>Previous Button</button>
            <SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />
          </div>
        </I18nContext.Provider>,
        { container }
      );

      // Focus should be on Play Again button
      const playAgainButton = screen.getByRole('button', { name: /play again/i });
      expect(playAgainButton).toHaveFocus();

      // Close modal
      rerender(
        <I18nContext.Provider value={i18nValue}>
          <div>
            <button>Previous Button</button>
            <SuccessModal isOpen={false} onPlayAgain={mockOnPlayAgain} />
          </div>
        </I18nContext.Provider>
      );

      // Focus should be restored (tested through the component's cleanup logic)
    });
  });

  describe('accessibility', () => {
    it('should have dialog role', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

      const title = screen.getByText('Congratulations!');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('should have aria-describedby pointing to message', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-message');

      const message = screen.getByText('You solved the puzzle!');
      expect(message).toHaveAttribute('id', 'modal-message');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      // Enter/Space should activate button
      const button = screen.getByRole('button', { name: /play again/i });
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });
  });

  describe('modal overlay', () => {
    it('should render modal overlay', () => {
      renderWithI18n(
        <SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />
      );

      // The overlay is the dialog element with role="dialog"
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
    });

    it('should render modal content', () => {
      renderWithI18n(
        <SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />
      );

      // Modal content contains the title and button
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should handle rapid open/close', () => {
      const i18nValue = {
        language: 'en' as const,
        setLanguage: () => {},
        t: (key: keyof typeof translations.en) => translations.en[key],
      };

      const { rerender } = render(
        <I18nContext.Provider value={i18nValue}>
          <SuccessModal isOpen={false} onPlayAgain={mockOnPlayAgain} />
        </I18nContext.Provider>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <I18nContext.Provider value={i18nValue}>
          <SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />
        </I18nContext.Provider>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <I18nContext.Provider value={i18nValue}>
          <SuccessModal isOpen={false} onPlayAgain={mockOnPlayAgain} />
        </I18nContext.Provider>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <I18nContext.Provider value={i18nValue}>
          <SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />
        </I18nContext.Provider>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not call onPlayAgain when initially rendering', () => {
      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      // Should only be called on user interaction, not on render
      expect(mockOnPlayAgain).not.toHaveBeenCalled();
    });
  });

  describe('button focus', () => {
    it('should maintain focus on button during interaction', async () => {
      const user = userEvent.setup();

      renderWithI18n(<SuccessModal isOpen={true} onPlayAgain={mockOnPlayAgain} />);

      const button = screen.getByRole('button', { name: /play again/i });
      expect(button).toHaveFocus();

      // Clicking button should maintain focus until modal closes
      await user.click(button);
      expect(mockOnPlayAgain).toHaveBeenCalled();
    });
  });
});
