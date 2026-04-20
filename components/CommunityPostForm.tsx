import { PenLine } from 'lucide-react';

import { communityCategories } from '@/components/community/community';
import { createPost } from '@/lib/actions';

type CommunityPostFormProps = {
  authorName: string;
};

export default function CommunityPostForm({
  authorName,
}: CommunityPostFormProps) {
  return (
    <form action={createPost} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
        <PenLine size={16} />
        글 작성
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="authorDisplay"
            className="mb-1 block text-sm font-semibold"
            style={{ color: '#1E1B4B' }}
          >
            작성자
          </label>
          <input
            id="authorDisplay"
            type="text"
            value={authorName}
            readOnly
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{
              borderColor: '#E9D7C3',
              color: '#1E1B4B',
              backgroundColor: '#F8F4EE',
            }}
          />
          <input type="hidden" name="author" value={authorName} />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-semibold"
            style={{ color: '#1E1B4B' }}
          >
            카테고리
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
            style={{
              borderColor: '#E9D7C3',
              color: '#1E1B4B',
              backgroundColor: '#FFFCF8',
            }}
          >
            {communityCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-semibold"
          style={{ color: '#1E1B4B' }}
        >
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="제목을 입력해 주세요"
          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
          style={{
            borderColor: '#E9D7C3',
            color: '#1E1B4B',
            backgroundColor: '#FFFCF8',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-1 block text-sm font-semibold"
          style={{ color: '#1E1B4B' }}
        >
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={8}
          placeholder="나누고 싶은 이야기나 기도제목, 소식을 적어 주세요"
          className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
          style={{
            borderColor: '#E9D7C3',
            color: '#1E1B4B',
            backgroundColor: '#FFFCF8',
          }}
        />
      </div>

      <button
        type="submit"
        className="self-end rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-colors duration-200"
        style={{ backgroundColor: '#8B5E34' }}
      >
        등록하기
      </button>
    </form>
  );
}
