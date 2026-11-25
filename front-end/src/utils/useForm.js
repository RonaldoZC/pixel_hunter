import { useState } from 'react';

export default function useForm({ initial, validate, onEdit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    onEdit?.();
  };

  const reset = () => setForm(initial);

  const submit = async (run) => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) await run(form);
  };

  return { form, errors, setField, reset, submit };
}
