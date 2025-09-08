import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddEntryForm from './AddEntryForm';

describe('AddEntryForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Amount *')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Add Entry')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('has correct default values', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const amountInput = screen.getByLabelText('Amount *') as HTMLInputElement;
    const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
    const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;

    expect(amountInput.value).toBe('');
    expect(unitSelect.value).toBe('mg');
    expect(notesTextarea.value).toBe('');
  });

  it('updates form data when inputs change', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const amountInput = screen.getByLabelText('Amount *');
    const unitSelect = screen.getByLabelText('Unit');
    const notesTextarea = screen.getByLabelText('Notes');

    fireEvent.change(amountInput, { target: { value: '500' } });
    fireEvent.change(unitSelect, { target: { value: 'g' } });
    fireEvent.change(notesTextarea, { target: { value: 'Morning dose' } });

    expect((amountInput as HTMLInputElement).value).toBe('500');
    expect((unitSelect as HTMLSelectElement).value).toBe('g');
    expect((notesTextarea as HTMLTextAreaElement).value).toBe('Morning dose');
  });

  it('submits form with correct data', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const amountInput = screen.getByLabelText('Amount *');
    const unitSelect = screen.getByLabelText('Unit');
    const notesTextarea = screen.getByLabelText('Notes');
    const submitButton = screen.getByText('Add Entry');

    fireEvent.change(amountInput, { target: { value: '250' } });
    fireEvent.change(unitSelect, { target: { value: 'ml' } });
    fireEvent.change(notesTextarea, { target: { value: 'Post workout' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(250, 'ml', 'Post workout');
  });

  it('submits form with undefined notes when notes is empty', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const amountInput = screen.getByLabelText('Amount *');
    const submitButton = screen.getByText('Add Entry');

    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(100, 'mg', undefined);
  });

  it('shows alert when amount is empty', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByText('Add Entry');
    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith('Please enter an amount');
    expect(mockOnSubmit).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('has all unit options available', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const unitSelect = screen.getByLabelText('Unit') as HTMLSelectElement;
    const options = Array.from(unitSelect.options).map(
      (option) => option.value
    );

    expect(options).toEqual(['mg', 'g', 'ml', 'capsules', 'tablets']);
  });

  it('has proper form attributes', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const form = screen.getByRole('form');
    const amountInput = screen.getByLabelText('Amount *');
    const notesTextarea = screen.getByLabelText('Notes');

    expect(form).toHaveAttribute('method', 'post'); // Default form method
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('required');
    expect(amountInput).toHaveAttribute('min', '0');
    expect(amountInput).toHaveAttribute('step', '0.01');
    expect(notesTextarea).toHaveAttribute('rows', '3');
  });

  it('has proper accessibility attributes', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Amount *')).toHaveAttribute('id', 'amount');
    expect(screen.getByLabelText('Unit')).toHaveAttribute('id', 'unit');
    expect(screen.getByLabelText('Notes')).toHaveAttribute('id', 'notes');
  });

  it('prevents default form submission', () => {
    render(<AddEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const form = screen.getByRole('form');
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(form, submitEvent);

    // If preventDefault wasn't called, the test would fail
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
