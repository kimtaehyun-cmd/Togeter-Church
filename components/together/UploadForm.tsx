'use client';

import { useState, useRef, useTransition } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { createTogetherPost } from '@/lib/actions';

export default function UploadForm() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setImages(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('최소 한 장의 사진을 선택해주세요.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    images.forEach(file => {
      formData.append('images', file);
    });

    startTransition(async () => {
      try {
        await createTogetherPost(formData);
      } catch (err: any) {
        // Don't catch Next.js redirect errors
        if (err.message === 'NEXT_REDIRECT') throw err;
        setError(err.message || '등록 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1E1B4B]" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="예: 2026년 봄 수련회 풍경"
          className="w-full rounded-2xl border border-[#EEE4D7] bg-[#FDFBF9] px-6 py-4 text-base focus:border-[#8B5E34] focus:outline-none focus:ring-1 focus:ring-[#8B5E34]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1E1B4B]" htmlFor="author">
          작성자
        </label>
        <input
          id="author"
          name="author"
          type="text"
          placeholder="이름 (생략 시 내 이름)"
          className="w-full rounded-2xl border border-[#EEE4D7] bg-[#FDFBF9] px-6 py-4 text-base focus:border-[#8B5E34] focus:outline-none focus:ring-1 focus:ring-[#8B5E34]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1E1B4B]" htmlFor="content">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          placeholder="사진과 함께 나눌 은혜로운 이야기를 적어주세요."
          className="w-full rounded-3xl border border-[#EEE4D7] bg-[#FDFBF9] px-6 py-4 text-base focus:border-[#8B5E34] focus:outline-none focus:ring-1 focus:ring-[#8B5E34] resize-none"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-[#1E1B4B]">사진 첨부</label>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-300 ${
            isDragging 
              ? 'border-[#8B5E34] bg-[#F5EBDD]/30 scale-[0.99]' 
              : 'border-[#EEE4D7] bg-[#FFFBF7] hover:border-[#8B5E34]/50 hover:bg-[#F5EBDD]/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 ${isDragging ? 'scale-110 bg-[#8B5E34] text-white' : 'bg-[#F5EBDD] text-[#8B5E34]'}`}>
              <Upload size={28} />
            </div>
            <p className="text-lg font-bold text-[#1E1B4B]">사진을 이곳에 끌어다 놓으세요</p>
            <p className="mt-2 text-sm text-[#64748B]">또는 클릭하여 파일을 선택할 수 있습니다 (여러 장 가능)</p>
          </div>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl border border-[#EEE4D7]">
                <Image src={preview} alt="미리보기" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md transition-all hover:bg-red-500 group-hover:opacity-100 sm:opacity-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className={`flex w-full items-center justify-center gap-3 rounded-[2rem] py-5 text-lg font-bold text-white shadow-xl transition-all ${
            isPending 
              ? 'bg-[#94A3B8] cursor-not-allowed' 
              : 'bg-[#1E1B4B] hover:scale-[1.01] hover:opacity-95'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>등록하는 중...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>소중한 순간 등록하기</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
