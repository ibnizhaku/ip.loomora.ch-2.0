import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "spreadsheet" | "folder";
  size?: string;
  modifiedDate: string;
  modifiedBy: string;
  shared: boolean;
  items?: number;
  parentId?: string | null; // null = root level
}

interface DocumentsContextType {
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, "id"> & { id?: string }) => DocumentItem;
  addFolder: (name: string, parentId?: string | null) => DocumentItem;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByParent: (parentId: string | null) => DocumentItem[];
  getFolder: (id: string) => DocumentItem | undefined;
  getFolderPath: (id: string) => DocumentItem[];
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

// Initial mock data with parentId structure
const initialDocuments: DocumentItem[] = [
  // Root level folders
  { id: "folder-1", name: "Projektverträge", type: "folder", modifiedDate: "vor 2 Std.", modifiedBy: "Max Keller", shared: true, items: 4, parentId: null },
  { id: "folder-4", name: "Marketingmaterial", type: "folder", modifiedDate: "vor 1 Woche", modifiedBy: "Sarah Koch", shared: true, items: 4, parentId: null },
  { id: "folder-6", name: "Produktfotos", type: "folder", modifiedDate: "vor 3 Wochen", modifiedBy: "Lisa Weber", shared: true, items: 4, parentId: null },
  
  // Root level files
  { id: "file-2", name: "Angebot_Fashion_Store_2024.pdf", type: "pdf", size: "2.4 MB", modifiedDate: "vor 1 Tag", modifiedBy: "Anna Schmidt", shared: true, parentId: null },
  { id: "file-3", name: "Rechnung_INV-2024-001.pdf", type: "pdf", size: "156 KB", modifiedDate: "vor 3 Tagen", modifiedBy: "Thomas Müller", shared: false, parentId: null },
  { id: "file-5", name: "Finanzbericht_Q4_2023.xlsx", type: "spreadsheet", size: "4.1 MB", modifiedDate: "vor 2 Wochen", modifiedBy: "Max Keller", shared: false, parentId: null },
  { id: "file-7", name: "Logo_Loomora_Final.png", type: "image", size: "890 KB", modifiedDate: "vor 1 Monat", modifiedBy: "Lisa Weber", shared: true, parentId: null },
  { id: "file-8", name: "Vertrag_FinTech_2024.docx", type: "doc", size: "245 KB", modifiedDate: "vor 1 Monat", modifiedBy: "Max Keller", shared: false, parentId: null },

  // Projektverträge contents (folder-1)
  { id: "file-1-1", name: "Vertrag_Müller_AG.pdf", type: "pdf", size: "1.2 MB", modifiedDate: "vor 2 Tagen", modifiedBy: "Max Keller", shared: false, parentId: "folder-1" },
  { id: "file-1-2", name: "Vertrag_Schmidt_GmbH.pdf", type: "pdf", size: "890 KB", modifiedDate: "vor 1 Woche", modifiedBy: "Anna Schmidt", shared: false, parentId: "folder-1" },
  { id: "file-1-3", name: "Rahmenvertrag_2024.docx", type: "doc", size: "245 KB", modifiedDate: "vor 2 Wochen", modifiedBy: "Max Keller", shared: false, parentId: "folder-1" },
  { id: "folder-1-4", name: "Archiv", type: "folder", modifiedDate: "vor 1 Monat", modifiedBy: "System", shared: false, items: 0, parentId: "folder-1" },

  // Marketingmaterial contents (folder-4)
  { id: "file-4-1", name: "Broschüre_2024.pdf", type: "pdf", size: "5.4 MB", modifiedDate: "vor 3 Tagen", modifiedBy: "Lisa Weber", shared: false, parentId: "folder-4" },
  { id: "file-4-2", name: "Banner_Homepage.png", type: "image", size: "2.1 MB", modifiedDate: "vor 1 Woche", modifiedBy: "Lisa Weber", shared: false, parentId: "folder-4" },
  { id: "folder-4-3", name: "Social Media", type: "folder", modifiedDate: "vor 2 Wochen", modifiedBy: "Sarah Koch", shared: false, items: 0, parentId: "folder-4" },
  { id: "folder-4-4", name: "Präsentationen", type: "folder", modifiedDate: "vor 3 Wochen", modifiedBy: "Max Keller", shared: false, items: 0, parentId: "folder-4" },

  // Produktfotos contents (folder-6)
  { id: "file-6-1", name: "Produkt_A_Front.jpg", type: "image", size: "3.2 MB", modifiedDate: "vor 1 Tag", modifiedBy: "Lisa Weber", shared: false, parentId: "folder-6" },
  { id: "file-6-2", name: "Produkt_A_Back.jpg", type: "image", size: "2.8 MB", modifiedDate: "vor 1 Tag", modifiedBy: "Lisa Weber", shared: false, parentId: "folder-6" },
  { id: "file-6-3", name: "Produkt_B_Front.jpg", type: "image", size: "3.5 MB", modifiedDate: "vor 2 Tagen", modifiedBy: "Lisa Weber", shared: false, parentId: "folder-6" },
  { id: "folder-6-4", name: "Katalog_2024", type: "folder", modifiedDate: "vor 1 Woche", modifiedBy: "Sarah Koch", shared: false, items: 0, parentId: "folder-6" },
];

const STORAGE_KEY = "documents-data";

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialDocuments;
      }
    }
    return initialDocuments;
  });

  // Save to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc: Omit<DocumentItem, "id"> & { id?: string }): DocumentItem => {
    const newDoc: DocumentItem = {
      ...doc,
      id: doc.id || `file-${Date.now()}`,
    };
    setDocuments(prev => [newDoc, ...prev]);
    
    // Update parent folder item count if there's a parent
    if (newDoc.parentId) {
      updateFolderItemCount(newDoc.parentId);
    }
    
    return newDoc;
  };

  const addFolder = (name: string, parentId: string | null = null): DocumentItem => {
    const newFolder: DocumentItem = {
      id: `folder-${Date.now()}`,
      name,
      type: "folder",
      modifiedDate: "gerade eben",
      modifiedBy: "Max Keller",
      shared: false,
      items: 0,
      parentId,
    };
    setDocuments(prev => [newFolder, ...prev]);
    
    // Update parent folder item count if there's a parent
    if (parentId) {
      updateFolderItemCount(parentId);
    }
    
    return newFolder;
  };

  const updateFolderItemCount = (folderId: string) => {
    setDocuments(prev => {
      const itemCount = prev.filter(d => d.parentId === folderId).length + 1; // +1 for the new item
      return prev.map(d => 
        d.id === folderId ? { ...d, items: itemCount } : d
      );
    });
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates, modifiedDate: "gerade eben" } : d
    ));
  };

  const deleteDocument = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    
    // If it's a folder, also delete all children
    if (docToDelete?.type === "folder") {
      const childIds = getAllChildIds(id);
      setDocuments(prev => prev.filter(d => d.id !== id && !childIds.includes(d.id)));
    } else {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
    
    // Update parent folder item count
    if (docToDelete?.parentId) {
      setDocuments(prev => {
        const parentId = docToDelete.parentId;
        const itemCount = prev.filter(d => d.parentId === parentId && d.id !== id).length;
        return prev.map(d => 
          d.id === parentId ? { ...d, items: itemCount } : d
        );
      });
    }
  };

  const getAllChildIds = (folderId: string): string[] => {
    const children = documents.filter(d => d.parentId === folderId);
    let allIds: string[] = children.map(c => c.id);
    
    children.filter(c => c.type === "folder").forEach(folder => {
      allIds = [...allIds, ...getAllChildIds(folder.id)];
    });
    
    return allIds;
  };

  const getDocumentsByParent = (parentId: string | null): DocumentItem[] => {
    return documents.filter(d => d.parentId === parentId);
  };

  const getFolder = (id: string): DocumentItem | undefined => {
    return documents.find(d => d.id === id && d.type === "folder");
  };

  const getFolderPath = (id: string): DocumentItem[] => {
    const path: DocumentItem[] = [];
    let currentId: string | null | undefined = id;
    
    while (currentId) {
      const folder = documents.find(d => d.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path;
  };

  return (
    <DocumentsContext.Provider value={{
      documents,
      addDocument,
      addFolder,
      updateDocument,
      deleteDocument,
      getDocumentsByParent,
      getFolder,
      getFolderPath,
    }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
