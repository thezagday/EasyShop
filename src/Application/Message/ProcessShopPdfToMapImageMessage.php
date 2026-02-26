<?php

namespace App\Application\Message;

final class ProcessShopPdfToMapImageMessage
{
    public function __construct(
        private readonly int $shopId,
        private readonly string $pdfFileName
    ) {
    }

    public function getShopId(): int
    {
        return $this->shopId;
    }

    public function getPdfFileName(): string
    {
        return $this->pdfFileName;
    }
}
