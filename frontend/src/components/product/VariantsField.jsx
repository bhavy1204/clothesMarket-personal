import { useFieldArray } from "react-hook-form";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function VariantsField({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">Size & quantity</span>
        <button
          type="button"
          onClick={() => append({ size: "", quantity: 0 })}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
        >
          <PlusIcon size={14} />
          Add size
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-text-muted">
          No sizes added yet. Click "Add size" to get started.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-2 rounded-md border border-border p-2.5"
          >
            <div className="flex flex-col gap-1 w-28">
              <select
                className="h-10 rounded-md border border-border-strong bg-surface px-2 text-sm text-text focus:border-primary focus:outline-none"
                {...register(`variants.${index}.size`)}
                defaultValue=""
              >
                <option value="" disabled>
                  Size
                </option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.variants?.[index]?.size && (
                <span className="text-xs text-danger">
                  {errors.variants[index].size.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <input
                type="number"
                min={0}
                placeholder="Quantity"
                className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none"
                {...register(`variants.${index}.quantity`)}
              />
              {errors.variants?.[index]?.quantity && (
                <span className="text-xs text-danger">
                  {errors.variants[index].quantity.message}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="h-10 w-10 flex items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger-subtle transition-colors"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      {errors.variants?.message && (
        <span className="text-xs text-danger">{errors.variants.message}</span>
      )}
    </div>
  );
}

