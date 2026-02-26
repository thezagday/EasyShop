<?php

namespace App\Application\MessageHandler;

use App\Application\Message\ProcessShopPdfToMapImageMessage;
use App\Domain\Entity\Shop;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Process\Process;

#[AsMessageHandler]
final class ProcessShopPdfToMapImageHandler
{
    private const MAP_WIDTH = 1653;
    private const MAP_HEIGHT = 993;
    private const PDF_RASTER_SCALE = 4;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        #[Autowire('%kernel.project_dir%')] private readonly string $projectDir
    ) {
    }

    public function __invoke(ProcessShopPdfToMapImageMessage $message): void
    {
        $shopId = $message->getShopId();
        $pdfFile = $message->getPdfFileName();

        $this->logger->info('Starting PDF to PNG conversion', [
            'shop_id' => $shopId,
            'pdf_file' => $pdfFile,
        ]);

        $shop = $this->entityManager->getRepository(Shop::class)->find($shopId);

        if (!$shop) {
            $this->logger->error('Shop not found', ['shop_id' => $shopId]);
            return;
        }

        $publicImgDir = $this->projectDir . '/public/img';

        if (!is_dir($publicImgDir)) {
            @mkdir($publicImgDir, 0775, true);
        }

        $pdfAbsPath = $publicImgDir . '/' . $pdfFile;

        if (!is_file($pdfAbsPath)) {
            $this->logger->error('PDF file not found', ['path' => $pdfAbsPath]);
            return;
        }

        $baseName = pathinfo($pdfFile, PATHINFO_FILENAME);
        if ($baseName === '') {
            $this->logger->error('Could not determine PDF base name');
            return;
        }

        $pdfMTime = @filemtime($pdfAbsPath);
        if (!is_int($pdfMTime) || $pdfMTime <= 0) {
            $pdfMTime = time();
        }

        $outputBaseName = sprintf('%s-%d', $baseName, $pdfMTime);
        $pngFileName = $outputBaseName . '.png';
        $outputBaseAbsPath = $publicImgDir . '/' . $outputBaseName;

        $rawOutputBaseName = $outputBaseName . '-raw';
        $rawOutputBaseAbsPath = $publicImgDir . '/' . $rawOutputBaseName;
        $rawPngAbsPath = $publicImgDir . '/' . $rawOutputBaseName . '.png';

        $targetWidthPx = (string) (self::MAP_WIDTH * self::PDF_RASTER_SCALE);
        $targetHeightPx = (string) (self::MAP_HEIGHT * self::PDF_RASTER_SCALE);

        // Step 1: Render PDF to PNG at high resolution
        $renderProcess = new Process([
            'pdftocairo',
            '-png',
            '-f',
            '1',
            '-l',
            '1',
            '-singlefile',
            '-r',
            '600',
            $pdfAbsPath,
            $rawOutputBaseAbsPath,
        ]);
        $renderProcess->setTimeout(120);
        $renderProcess->run();

        if (!$renderProcess->isSuccessful()) {
            $this->logger->error('PDF rendering failed', [
                'error' => trim($renderProcess->getErrorOutput()),
            ]);
            return;
        }

        if (!is_file($rawPngAbsPath)) {
            $this->logger->error('Raw PNG was not created', ['path' => $rawPngAbsPath]);
            return;
        }

        // Step 2: Resize and pad the image
        $pngAbsPath = $publicImgDir . '/' . $pngFileName;
        $extent = sprintf('%sx%s', $targetWidthPx, $targetHeightPx);

        $padProcess = new Process([
            'convert',
            $rawPngAbsPath,
            '-resize',
            $extent,
            '-background',
            'white',
            '-gravity',
            'center',
            '-extent',
            $extent,
            $pngAbsPath,
        ]);
        $padProcess->setTimeout(120);
        $padProcess->run();

        if (!$padProcess->isSuccessful()) {
            $this->logger->error('Image padding failed', [
                'error' => trim($padProcess->getErrorOutput()),
            ]);
            return;
        }

        if (!is_file($pngAbsPath)) {
            $this->logger->error('Final PNG was not created', ['path' => $pngAbsPath]);
            return;
        }

        // Clean up raw file
        @unlink($rawPngAbsPath);

        // Update shop entity
        $shop->setMapImage($pngFileName);
        $this->entityManager->flush();

        $this->logger->info('PDF to PNG conversion completed successfully', [
            'shop_id' => $shopId,
            'output_file' => $pngFileName,
        ]);
    }
}
