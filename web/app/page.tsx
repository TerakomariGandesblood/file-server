"use client";

import { useState, useEffect } from "react";

interface FileData {
  path: string;
  file_name: string;
  create_time: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/list");
      if (!res.ok) {
        throw new Error("Failed to fetch files.");
      }
      const data: FileData[] = await res.json();
      setFiles(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("上传失败");
      }

      setUploadSuccess(`文件 "${file.name}" 上传成功！`);

      // 3 秒后清除成功提示
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);

      // 重新获取文件列表
      await fetchFiles();

      // 清空文件选择
      event.target.value = "";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("上传时发生未知错误");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getFileExtension = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext || "";
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    const iconMap: { [key: string]: string } = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📊",
      pptx: "📊",
      txt: "📃",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      svg: "🖼️",
      zip: "📦",
      rar: "📦",
      "7z": "📦",
      mp4: "🎥",
      avi: "🎥",
      mkv: "🎥",
      mp3: "🎵",
      wav: "🎵",
      default: "📁",
    };
    return iconMap[ext] || iconMap.default;
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            文件下载中心
          </h1>
          <p className="text-lg text-gray-600">快速查找并下载您需要的文件</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <p className="text-green-800 font-medium">{uploadSuccess}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center w-full px-6 py-4 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {uploading ? "上传中..." : "上传文件"}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="搜索文件名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 text-gray-900 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总文件数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {files.length}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">搜索结果</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredFiles.length}
                </p>
              </div>
              <div className="text-4xl">🔍</div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    文件名
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    创建时间
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => (
                    <tr
                      key={file.file_name}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getFileIcon(file.file_name)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.file_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getFileExtension(file.file_name).toUpperCase()}{" "}
                              文件
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {file.create_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <a
                          href={`/${file.path}`}
                          download={file.file_name}
                          className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          下载
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg font-medium text-gray-700 mb-1">
                          {searchQuery
                            ? "未找到匹配的文件"
                            : "暂无可下载的文件"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {searchQuery
                            ? "请尝试其他搜索关键词"
                            : "请稍后再来查看"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
