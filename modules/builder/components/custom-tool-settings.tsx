'use client';

import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

import {
  httpMethods,
  httpMethodSchema,
  paramTypes,
  paramTypeSchema,
  toToolName,
  type CustomToolConfig,
  type CustomToolParam,
} from '../lib/custom-tool';

export function CustomToolSettings({
  config,
  onChange,
  onRemove,
}: {
  config: CustomToolConfig;
  onChange: (config: CustomToolConfig) => void;
  onRemove: () => void;
}) {
  function update(partial: Partial<CustomToolConfig>) {
    onChange({ ...config, ...partial });
  }

  function updateParam(index: number, partial: Partial<CustomToolParam>) {
    update({
      parameters: config.parameters.map((param, i) =>
        i === index ? { ...param, ...partial } : param,
      ),
    });
  }

  function updateHeader(
    index: number,
    partial: Partial<CustomToolConfig['headers'][number]>,
  ) {
    update({
      headers: config.headers.map((header, i) =>
        i === index ? { ...header, ...partial } : header,
      ),
    });
  }

  return (
    <div className="space-y-5">
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="custom-tool-name">Tool name</FieldLabel>
          <Input
            id="custom-tool-name"
            value={config.name}
            onChange={(event) => update({ name: event.target.value })}
          />
          <FieldDescription aria-live="polite">
            Identifier{' '}
            <code className="text-foreground font-mono text-xs wrap-anywhere">
              {toToolName(config.name)}
            </code>
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="custom-tool-description">Description</FieldLabel>
          <Textarea
            id="custom-tool-description"
            rows={3}
            value={config.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </Field>
      </FieldGroup>

      <section
        aria-labelledby="tool-request"
        className="space-y-3 border-t border-dashed pt-4"
      >
        <h3 id="tool-request" className="text-sm font-medium">
          Request
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="tool-method">Method</FieldLabel>
            <NativeSelect
              id="tool-method"
              value={config.method}
              onChange={(event) => {
                const result = httpMethodSchema.safeParse(event.target.value);
                if (result.success) update({ method: result.data });
              }}
            >
              {httpMethods.map((method) => (
                <NativeSelectOption key={method} value={method}>
                  {method}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="tool-timeout">Timeout (ms)</FieldLabel>
            <Input
              id="tool-timeout"
              type="number"
              min={1}
              step={1}
              defaultValue={config.timeoutMs}
              onBlur={(event) => {
                const input = event.currentTarget;
                if (
                  input.validity.valid &&
                  Number.isInteger(input.valueAsNumber) &&
                  input.valueAsNumber > 0
                ) {
                  update({ timeoutMs: input.valueAsNumber });
                } else {
                  input.value = String(config.timeoutMs);
                }
              }}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="tool-url">URL</FieldLabel>
          <Input
            id="tool-url"
            value={config.url}
            placeholder="https://api.example.com/data?q={{query}}"
            onChange={(event) => update({ url: event.target.value })}
          />
          <FieldDescription>
            Insert parameter values with{' '}
            <code className="font-mono text-xs">{'{{parameter}}'}</code>.
          </FieldDescription>
        </Field>
        {config.method !== 'GET' && (
          <Field>
            <FieldLabel htmlFor="tool-body">Request body (JSON)</FieldLabel>
            <Textarea
              id="tool-body"
              rows={4}
              value={config.body}
              onChange={(event) => update({ body: event.target.value })}
              className="font-mono text-xs"
            />
          </Field>
        )}
      </section>

      <section
        aria-labelledby="tool-headers"
        className="space-y-2 border-t border-dashed pt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="tool-headers" className="text-sm font-medium">
            Headers
          </h3>
          <Button
            variant="outline"
            size="xs"
            onClick={() =>
              update({ headers: [...config.headers, { key: '', value: '' }] })
            }
            className="motion-reduce:transition-none"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              data-icon="inline-start"
              aria-hidden="true"
            />
            Add header
          </Button>
        </div>
        {config.headers.map((header, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2"
          >
            <Input
              aria-label={`Header ${index + 1} name`}
              placeholder="Name"
              value={header.key}
              onChange={(event) =>
                updateHeader(index, { key: event.target.value })
              }
            />
            <Input
              aria-label={`Header ${index + 1} value`}
              placeholder="Value"
              value={header.value}
              onChange={(event) =>
                updateHeader(index, { value: event.target.value })
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove header ${index + 1}`}
              className="hover:text-destructive motion-reduce:transition-none"
              onClick={() =>
                update({
                  headers: config.headers.filter((_, i) => i !== index),
                })
              }
            >
              <HugeiconsIcon icon={Delete02Icon} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </section>

      <section
        aria-labelledby="tool-parameters"
        className="space-y-2 border-t border-dashed pt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="tool-parameters" className="text-sm font-medium">
            Parameters
          </h3>
          <Button
            variant="outline"
            size="xs"
            onClick={() =>
              update({
                parameters: [
                  ...config.parameters,
                  {
                    name: 'param',
                    type: 'string',
                    description: '',
                    required: false,
                  },
                ],
              })
            }
            className="motion-reduce:transition-none"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              data-icon="inline-start"
              aria-hidden="true"
            />
            Add parameter
          </Button>
        </div>
        {config.parameters.map((param, index) => (
          <Card key={index} className="gap-2 border p-3 shadow-xs ring-0">
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label={`Parameter ${index + 1} name`}
                placeholder="Name"
                value={param.name}
                onChange={(event) =>
                  updateParam(index, { name: event.target.value })
                }
              />
              <NativeSelect
                aria-label={`Parameter ${index + 1} type`}
                className="w-full min-w-0"
                value={param.type}
                onChange={(event) => {
                  const result = paramTypeSchema.safeParse(event.target.value);
                  if (result.success) updateParam(index, { type: result.data });
                }}
              >
                {paramTypes.map((type) => (
                  <NativeSelectOption key={type} value={type}>
                    {type}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Input
              aria-label={`Parameter ${index + 1} description`}
              placeholder="Description"
              value={param.description}
              onChange={(event) =>
                updateParam(index, { description: event.target.value })
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FieldLabel className="flex items-center gap-2">
                <Checkbox
                  checked={param.required}
                  aria-label={`Parameter ${index + 1} required`}
                  onCheckedChange={(checked) =>
                    updateParam(index, { required: checked })
                  }
                />
                Required
              </FieldLabel>
              <Button
                variant="ghost"
                size="xs"
                aria-label={`Remove parameter ${index + 1}`}
                className="hover:text-destructive motion-reduce:transition-none"
                onClick={() =>
                  update({
                    parameters: config.parameters.filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </section>
      <Button
        variant="destructive"
        size="sm"
        onClick={onRemove}
        className="motion-reduce:transition-none"
      >
        <HugeiconsIcon
          icon={Delete02Icon}
          data-icon="inline-start"
          aria-hidden="true"
        />
        Remove custom tool
      </Button>
    </div>
  );
}
