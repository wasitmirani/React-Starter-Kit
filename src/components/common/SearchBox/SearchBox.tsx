import React, { useState } from "react";
import { searchService } from "@/services/search.service";

// SearchBoxProps
interface SearchBoxProps {
    placeholder?: string | 'Search...';
    onChange: (value: string) => void;
    onSearch: () => void;
    onClear: () => void;
    onEnter: () => void;
    onEscape: () => void;
    icon?: string;
    apiUrl: string;
}

export function SearchBox({ placeholder = 'Search...', onChange, onSearch, onClear, onEnter, onEscape, apiUrl }: SearchBoxProps) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [internalValue, setInternalValue] = useState(search);


    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
        onChange(e.target.value);
    }
    const handleSearch  = () =>{
        setLoading(true);
        searchService.search(apiUrl, internalValue).then((data)=>{
            setResults(data);
            setLoading(false);
        }).catch((error)=>{
            console.error(error);
            setLoading(false);
        }).finally(()=>{
            setLoading(false);
        })
    }
    
    return (
    <>
    <div  className="flex-shrink-0">
                        <div  className="position-relative">
                            <input type="text"  className="form-control bg-light-subtle border-0 pe-9" placeholder={placeholder} value={search} onChange={(e) => setSearch(e.target.value)}/>
                            <i  className="mgc_search_ai_line position-absolute top-50 end-0 me-3 translate-middle-y text-muted"></i>
                        </div>
                    </div>
    </>
    )
}