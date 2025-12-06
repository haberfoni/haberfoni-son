import React, { useState, useRef, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Code, Eye } from 'lucide-react';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';

// Register the module
Quill.register('modules/blotFormatter', BlotFormatter);

const RichTextEditor = ({ value, onChange, placeholder }) => {
    const [showSource, setShowSource] = useState(false);
    const quillRef = useRef(null);

    const modules = useMemo(() => ({
        blotFormatter: {}, // Enable the module
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean'],
                [{ 'color': [] }, { 'background': [] }]
            ]
        }
    }), []);

    const handleChange = (content) => {
        onChange(content);
    };

    const handleSourceChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="rich-text-editor-container border border-gray-300 rounded-lg bg-white">
            <div className="flex justify-end bg-gray-50 border-b border-gray-200 px-2 py-1">
                <button
                    type="button"
                    onClick={() => setShowSource(!showSource)}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-600 hover:text-primary px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    title={showSource ? "Önizlemeyi Gör" : "Kaynak Kodunu Gör"}
                >
                    {showSource ? (
                        <>
                            <Eye size={14} />
                            <span>Önizleme</span>
                        </>
                    ) : (
                        <>
                            <Code size={14} />
                            <span>Kaynak</span>
                        </>
                    )}
                </button>
            </div>

            {showSource ? (
                <textarea
                    value={value}
                    onChange={handleSourceChange}
                    className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-y"
                    placeholder="HTML kodunu buraya yazın..."
                />
            ) : (
                <div className="bg-white">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value}
                        onChange={handleChange}
                        modules={modules}
                        placeholder={placeholder}
                        className="h-80 mb-12" // mb-12 to account for toolbar height if needed or create space
                    />
                </div>
            )}

            <style>{`
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    font-family: inherit;
                    font-size: 1rem;
                }
                .ql-toolbar {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    background-color: #f9fafb;
                }
                .ql-container.ql-snow {
                    border: none !important;
                }
                .ql-editor {
                    min-height: 20rem;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
