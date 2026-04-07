import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Pagination() {
    const { t } = useTranslation();
    return (
        <div className="row tm-mb-90">
            <div className="col-12 d-flex justify-content-between align-items-center tm-paging-col">
                <a href="#" onClick={e => e.preventDefault()} className="btn btn-primary tm-btn-prev mb-2 disabled">{t('common.previous')}</a>
                <div className="tm-paging d-flex">
                    <a href="#" onClick={e => e.preventDefault()} className="active tm-paging-link">1</a>
                    <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">2</a>
                    <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">3</a>
                    <a href="#" onClick={e => e.preventDefault()} className="tm-paging-link">4</a>
                </div>
                <a href="#" onClick={e => e.preventDefault()} className="btn btn-primary tm-btn-next">{t('common.next')}</a>
            </div>
        </div>
    );
}