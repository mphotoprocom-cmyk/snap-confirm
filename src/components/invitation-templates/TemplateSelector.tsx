import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { TEMPLATE_CONFIGS, TemplateType } from './types';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATE_CONFIGS.map((template) => (
        <Card
          key={template.id}
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg overflow-hidden',
            value === template.id && 'ring-2 ring-primary'
          )}
          onClick={() => onChange(template.id)}
        >
          {/* Preview */}
          <div
            className="h-40 relative overflow-hidden"
            style={{ background: template.colors.background }}
          >
            {/* Decorative elements based on template */}
            {template.id === 'classic' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-32 h-32 border-2 rotate-45"
                  style={{ borderColor: template.colors.secondary }}
                />
                <div
                  className="absolute w-24 h-24 border rotate-45"
                  style={{ borderColor: template.colors.accent }}
                />
                <div className="absolute text-center">
                  <p
                    className="text-xs tracking-widest"
                    style={{ color: template.colors.secondary, fontFamily: template.fonts.body }}
                  >
                    THE WEDDING OF
                  </p>
                  <p
                    className="text-lg mt-1"
                    style={{ color: template.colors.primary, fontFamily: template.fonts.heading }}
                  >
                    A & B
                  </p>
                </div>
              </div>
            )}

            {template.id === 'modern' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-20 h-0.5 mx-auto mb-3"
                    style={{ background: template.colors.secondary }}
                  />
                  <p
                    className="text-2xl tracking-[0.3em]"
                    style={{ color: template.colors.primary, fontFamily: template.fonts.heading }}
                  >
                    A & B
                  </p>
                  <div
                    className="w-20 h-0.5 mx-auto mt-3"
                    style={{ background: template.colors.secondary }}
                  />
                </div>
              </div>
            )}

            {template.id === 'floral' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute top-2 left-2 w-12 h-12 rounded-full opacity-30"
                  style={{ background: template.colors.accent }}
                />
                <div
                  className="absolute bottom-2 right-2 w-16 h-16 rounded-full opacity-20"
                  style={{ background: template.colors.secondary }}
                />
                <div className="text-center z-10">
                  <p
                    className="text-3xl"
                    style={{ color: template.colors.primary, fontFamily: template.fonts.heading }}
                  >
                    A & B
                  </p>
                  <p
                    className="text-xs mt-2 tracking-wider"
                    style={{ color: template.colors.text, fontFamily: template.fonts.body }}
                  >
                    are getting married
                  </p>
                </div>
              </div>
            )}

            {template.id === 'minimal' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p
                    className="text-4xl font-light tracking-wider"
                    style={{ color: template.colors.primary, fontFamily: template.fonts.heading }}
                  >
                    A & B
                  </p>
                </div>
              </div>
            )}

            {template.id === 'luxury' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute inset-4 border opacity-30"
                  style={{ borderColor: template.colors.secondary }}
                />
                <div
                  className="absolute inset-6 border opacity-20"
                  style={{ borderColor: template.colors.accent }}
                />
                <div className="text-center z-10">
                  <p
                    className="text-xs tracking-[0.4em] mb-2"
                    style={{ color: template.colors.secondary }}
                  >
                    ✦ THE WEDDING OF ✦
                  </p>
                  <p
                    className="text-2xl tracking-wider"
                    style={{ color: template.colors.text, fontFamily: template.fonts.heading }}
                  >
                    A & B
                  </p>
                </div>
              </div>
            )}

            {/* Selected indicator */}
            {value === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{template.name}</h3>
              {template.id === 'luxury' && (
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
