import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export interface NodeData {
    reference?: string;
    title: string;
    description: string;
    brush?: string;
    dir?: string;
    loc?: string;
}

interface NodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NodeData) => void;
  initialData?: NodeData;
    parentNode?: any;
}

export function NodeFormDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
    parentNode,
}: NodeFormDialogProps) {
  const [formData, setFormData] = useState<NodeData>({
    reference: "",
    title: "",
    description: "",
    brush: "skyblue",
    dir: "right",
  });

  useEffect(() => {
    if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialData);
    } else {
        setFormData({
            reference: "",
            title: "",
            description: "",
            brush: "skyblue",
            dir: "right",
        });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Add New Node
            </Dialog.Title>
            <Dialog.Close className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter node title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>

                {parentNode && parentNode.key == 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={formData.dir}
                  onChange={(e) =>
                    setFormData({ ...formData, dir: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
    )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Color
                </label>
                <select
                  value={formData.brush}
                  onChange={(e) =>
                    setFormData({ ...formData, brush: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="skyblue">Sky Blue</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
