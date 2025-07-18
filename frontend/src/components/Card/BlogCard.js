import { ArrowRight } from "lucide-react";

const BlogCard = ({ titulo, conteudo, link }) => {
    return (
        <div className="bg-white dark:bg-[#2a246f] rounded-xl shadow-md p-5 transition hover:scale-[1.02] hover:shadow-lg duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{titulo}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{conteudo}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#00d971] hover:underline text-sm font-medium"
            >
                Ler mais <ArrowRight size={16} className="ml-1" />
            </a>
        </div>
    );
};

export default BlogCard;
