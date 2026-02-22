import React from 'react';

const Step = ({ icon, title, desc }) => (
    <div className="flex-1 min-w-[140px] text-center">
        <div className="text-3xl text-accent-primary mb-4 bg-[rgba(0,243,255,0.1)] w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto border border-[rgba(0,243,255,0.3)]">
            <i className={`fas ${icon}`}></i>
        </div>
        <h4 className="font-heading mb-2">{title}</h4>
        <p className="text-text-secondary text-sm">{desc}</p>
    </div>
);

export default Step;
