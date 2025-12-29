import React, { createContext, useContext, useState, useEffect } from 'react';

export type PersonaType = 'VISIONARY' | 'INVESTOR' | 'SPECIALIST' | 'FOUNDER';

export interface Persona {
    id: PersonaType;
    name: string;
    label: string;
    description: string;
    color: string;
    secondaryColor: string;
    icon: string;
}

export const PERSONAS: Record<PersonaType, Persona> = {
    VISIONARY: {
        id: 'VISIONARY',
        name: '技术远见者',
        label: 'VISIONARY',
        description: '关注颠覆性技术、基础研发与长周期指数级变革。',
        color: 'from-blue-600 to-indigo-600',
        secondaryColor: 'bg-blue-50 text-blue-600',
        icon: '🔭'
    },
    INVESTOR: {
        id: 'INVESTOR',
        name: '价值投资者',
        label: 'INVESTOR',
        description: '聚焦财报分析、市场分额、宏观政策及红利窗口。',
        color: 'from-amber-500 to-orange-600',
        secondaryColor: 'bg-amber-50 text-amber-600',
        icon: '📈'
    },
    SPECIALIST: {
        id: 'SPECIALIST',
        name: '产品专家',
        label: 'SPECIALIST',
        description: '专注 UX 体验、竞对功能拆解与增长黑客手段。',
        color: 'from-emerald-500 to-teal-600',
        secondaryColor: 'bg-emerald-50 text-emerald-600',
        icon: '🎨'
    },
    FOUNDER: {
        id: 'FOUNDER',
        name: '创业者',
        label: 'FOUNDER',
        description: '侧重资源杠杆、快速验证、组织进化与融资情报。',
        color: 'from-rose-500 to-pink-600',
        secondaryColor: 'bg-rose-50 text-rose-600',
        icon: '🚀'
    }
};

interface PersonaContextType {
    currentPersona: Persona;
    setPersona: (type: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [personaType, setPersonaType] = useState<PersonaType>(() => {
        const saved = localStorage.getItem('moss_persona');
        return (saved as PersonaType) || 'SPECIALIST';
    });

    useEffect(() => {
        localStorage.setItem('moss_persona', personaType);
    }, [personaType]);

    const setPersona = (type: PersonaType) => {
        setPersonaType(type);
    };

    return (
        <PersonaContext.Provider value={{ currentPersona: PERSONAS[personaType], setPersona }}>
            {children}
        </PersonaContext.Provider>
    );
};

export const usePersona = () => {
    const context = useContext(PersonaContext);
    if (!context) throw new Error('usePersona must be used within a PersonaProvider');
    return context;
};
