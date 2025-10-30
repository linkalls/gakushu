import React, { createContext, useContext, useState, useCallback } from 'react';

interface CustomTemplate {
  id: number;
  name: string;
  frontTemplate: string;
  backTemplate: string;
  css?: string;
  javascript?: string;
  isPublic: boolean;
  downloadCount: number;
}

interface TemplateContextType {
  templates: CustomTemplate[];
  publicTemplates: CustomTemplate[];
  currentTemplate: CustomTemplate | null;
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchPublicTemplates: () => Promise<void>;
  getTemplate: (id: number) => Promise<CustomTemplate>;
  createTemplate: (template: Omit<CustomTemplate, 'id' | 'downloadCount'>) => Promise<CustomTemplate>;
  updateTemplate: (id: number, template: Partial<CustomTemplate>) => Promise<CustomTemplate>;
  deleteTemplate: (id: number) => Promise<void>;
  downloadTemplate: (id: number) => Promise<CustomTemplate>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<CustomTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<CustomTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates?public=true');
      if (!res.ok) throw new Error('Failed to fetch public templates');
      const data = await res.json();
      setPublicTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id: number): Promise<CustomTemplate> => {
    setError(null);
    const res = await fetch(`/api/templates/${id}`);
    if (!res.ok) throw new Error('Failed to get template');
    const data = await res.json();
    setCurrentTemplate(data);
    return data;
  }, []);

  const createTemplate = useCallback(async (
    template: Omit<CustomTemplate, 'id' | 'downloadCount'>
  ): Promise<CustomTemplate> => {
    setError(null);
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to create template');
    const data = await res.json();
    await fetchTemplates();
    return data;
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (
    id: number,
    template: Partial<CustomTemplate>
  ): Promise<CustomTemplate> => {
    setError(null);
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to update template');
    const data = await res.json();
    await fetchTemplates();
    return data;
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id: number) => {
    setError(null);
    const res = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete template');
    await fetchTemplates();
  }, [fetchTemplates]);

  const downloadTemplate = useCallback(async (id: number): Promise<CustomTemplate> => {
    setError(null);
    const res = await fetch(`/api/templates/${id}/download`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to download template');
    return res.json();
  }, []);

  return (
    <TemplateContext.Provider value={{
      templates,
      publicTemplates,
      currentTemplate,
      loading,
      error,
      fetchTemplates,
      fetchPublicTemplates,
      getTemplate,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      downloadTemplate,
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within TemplateProvider');
  }
  return context;
}
