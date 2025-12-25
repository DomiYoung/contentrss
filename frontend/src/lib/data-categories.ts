// Data View 分类配置
// 飞书多维表格 API 端点和 8 个分类视图

export const DATA_API_ENDPOINT = import.meta.env.VITE_BITABLE_API_ENDPOINT || 'https://gate.shjinjia.com.cn/api/databrain/Component/feishu-bitable';

export const DATA_CATEGORIES = [
    {
        id: 'legal',
        label: '法律法规',
        icon: '⚖️',
        viewId: 'vewZFBbw0U',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vewZFBbw0U',
        color: '#6366F1', // Indigo
    },
    {
        id: 'digital',
        label: '数字化',
        icon: '💻',
        viewId: 'vew8Csw1Hy',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vew8Csw1Hy',
        color: '#0EA5E9', // Sky
    },
    {
        id: 'brand',
        label: '品牌',
        icon: '🏷️',
        viewId: 'vewStcRQN1',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewStcRQN1',
        color: '#EC4899', // Pink
    },
    {
        id: 'rd',
        label: '新品研发',
        icon: '🧪',
        viewId: 'vewUfRT8TF',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewUfRT8TF',
        color: '#8B5CF6', // Violet
    },
    {
        id: 'global',
        label: '国际形势',
        icon: '🌍',
        viewId: 'vewoJhF5lw',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewoJhF5lw',
        color: '#14B8A6', // Teal
    },
    {
        id: 'insight',
        label: '行业洞察',
        icon: '📊',
        viewId: 'vewT0pFYJl',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewT0pFYJl',
        color: '#F59E0B', // Amber
    },
    {
        id: 'ai',
        label: 'AI',
        icon: '🤖',
        viewId: 'vewqkJUW4I',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewqkJUW4I',
        color: '#10B981', // Emerald
    },
    {
        id: 'management',
        label: '企业管理',
        icon: '🏢',
        viewId: 'vewxoauaTX',
        url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewxoauaTX',
        color: '#64748B', // Slate
    },
] as const;

export type DataCategory = typeof DATA_CATEGORIES[number];
export type DataCategoryId = DataCategory['id'];
