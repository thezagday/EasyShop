<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\ShopBanner;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;
use Symfony\Contracts\Translation\TranslatorInterface;

#[IsGranted('ROLE_ADMIN')]
class ShopBannerCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    public static function getEntityFqcn(): string
    {
        return ShopBanner::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular(new TranslatableMessage('banner.label_singular', [], 'admin'))
            ->setEntityLabelInPlural(new TranslatableMessage('banner.label_plural', [], 'admin'))
            ->setSearchFields(['title', 'shop.title'])
            ->setDefaultSort(['sortOrder' => 'ASC', 'id' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        $translator = $this->translator;

        yield IdField::new('id', new TranslatableMessage('common.id', [], 'admin'))->hideOnForm();
        yield AssociationField::new('shop', new TranslatableMessage('banner.fields.shop', [], 'admin'));
        yield TextField::new('title', new TranslatableMessage('banner.fields.title', [], 'admin'));
        yield TextField::new('imageFile', new TranslatableMessage('banner.fields.image_file', [], 'admin'))->onlyOnIndex();
        yield TextField::new('resolvedImageUrl', new TranslatableMessage('banner.fields.preview', [], 'admin'))
            ->formatValue(static function ($value, ?ShopBanner $entity) use ($translator): string {
                if (!$value) {
                    return '<span class="text-muted">' . $translator->trans('banner.fields.no_image', [], 'admin') . '</span>';
                }

                $source = $entity?->getImageFile() ? 'uploaded' : 'external';

                return sprintf(
                    '<div style="display:flex;align-items:center;gap:8px"><img src="%s" alt="banner" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #ddd"><span style="font-size:12px;color:#666">%s</span></div>',
                    htmlspecialchars($value, ENT_QUOTES),
                    $source
                );
            })
            ->renderAsHtml()
            ->onlyOnIndex();
        yield ImageField::new('imageFile', new TranslatableMessage('banner.fields.upload_image', [], 'admin'))
            ->setHelp(new TranslatableMessage('banner.fields.upload_help', [], 'admin'))
            ->setBasePath('/img')
            ->setUploadDir('public/img')
            ->setUploadedFileNamePattern('[name]-[timestamp].[extension]')
            ->setFormTypeOption('attr', ['accept' => 'image/*'])
            ->setRequired(false)
            ->onlyOnForms();
        yield TextField::new('resolvedImageUrl', new TranslatableMessage('banner.fields.resolved_image_url', [], 'admin'))
            ->setHelp(new TranslatableMessage('banner.fields.resolved_image_help', [], 'admin'))
            ->setFormTypeOption('disabled', true)
            ->setRequired(false)
            ->onlyOnForms();
        yield TextField::new('imageUrl', new TranslatableMessage('banner.fields.image_url', [], 'admin'))
            ->setHelp(new TranslatableMessage('banner.fields.image_url_help', [], 'admin'))
            ->setRequired(false);
        yield TextField::new('targetUrl', new TranslatableMessage('banner.fields.target_url', [], 'admin'))->setRequired(false);
        yield NumberField::new('x_coordinate', new TranslatableMessage('banner.fields.x_coordinate', [], 'admin'))->setRequired(false);
        yield NumberField::new('y_coordinate', new TranslatableMessage('banner.fields.y_coordinate', [], 'admin'))->setRequired(false);
        yield BooleanField::new('active', new TranslatableMessage('banner.fields.active', [], 'admin'));
        yield IntegerField::new('sortOrder', new TranslatableMessage('banner.fields.sort_order', [], 'admin'));
    }
}
