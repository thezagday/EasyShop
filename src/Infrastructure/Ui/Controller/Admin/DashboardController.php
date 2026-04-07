<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Category;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\ProductCollection;
use App\Domain\Entity\Retailer;
use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopBanner;
use App\Domain\Entity\ShopCategory;
use App\Domain\Entity\User;
use App\Domain\Entity\UserActivity;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Translation\TranslatableMessage;
use Symfony\Contracts\Translation\TranslatorInterface;

#[AdminDashboard]
#[IsGranted('ROLE_ADMIN')]
class DashboardController extends AbstractDashboardController
{
    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator,
        private readonly RequestStack $requestStack,
        private readonly TranslatorInterface $translator,
    ) {
    }

    #[Route('/admin', name: 'admin', host: '%admin_host%')]
    public function index(): Response
    {
        return $this->redirect(
            $this->adminUrlGenerator
                ->setController(ShopCrudController::class)
                ->generateUrl()
        );
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTranslationDomain('admin')
            ->setTitle($this->t('dashboard.title'));
    }

    public function configureAssets(): Assets
    {
        $request = $this->requestStack->getCurrentRequest();
        $locale = $request?->getLocale() ?? 'pl';

        $localeSwitcher = $this->renderView('admin/_ea_locale_switcher.html.twig', [
            'current_locale' => $locale,
        ]);

        return Assets::new()
            ->addHtmlContentToHead('<link rel="icon" href="/img/icon.svg" type="image/svg+xml">')
            ->addHtmlContentToHead('<link rel="icon" href="/favicon.ico" sizes="any">')
            ->addHtmlContentToBody($localeSwitcher);
    }

    public function configureUserMenu(\Symfony\Component\Security\Core\User\UserInterface $user): \EasyCorp\Bundle\EasyAdminBundle\Config\UserMenu
    {
        return parent::configureUserMenu($user);
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard(new TranslatableMessage('dashboard.menu.dashboard', [], 'admin'), 'fa fa-home');
        yield MenuItem::section(new TranslatableMessage('dashboard.menu.shop_management', [], 'admin'));
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.retailers', [], 'admin'), 'fas fa-building', Retailer::class);
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.shops', [], 'admin'), 'fas fa-store', Shop::class);
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.categories', [], 'admin'), 'fas fa-list', Category::class);
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.shop_categories', [], 'admin'), 'fas fa-map-marker-alt', ShopCategory::class);
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.shop_banners', [], 'admin'), 'fas fa-bullhorn', ShopBanner::class);
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.commodities', [], 'admin'), 'fas fa-shopping-basket', Commodity::class);

        yield MenuItem::section(new TranslatableMessage('collection.label_plural', [], 'admin'));
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.collections', [], 'admin'), 'fas fa-gift', ProductCollection::class);

        yield MenuItem::section(new TranslatableMessage('dashboard.menu.user_management', [], 'admin'));
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.users', [], 'admin'), 'fas fa-users', User::class);

        yield MenuItem::section(new TranslatableMessage('dashboard.menu.analytics', [], 'admin'));
        yield MenuItem::linkToCrud(new TranslatableMessage('dashboard.menu.user_activity', [], 'admin'), 'fas fa-chart-line', UserActivity::class);

        yield MenuItem::section(new TranslatableMessage('dashboard.menu.links', [], 'admin'));
        $adminUrl = $this->getParameter('app_scheme') . '://' . $this->getParameter('admin_host') . '/';
        yield MenuItem::linkToUrl(new TranslatableMessage('dashboard.menu.back_to_website', [], 'admin'), 'fas fa-arrow-left', $adminUrl);
    }

    private function t(string $id): string
    {
        $locale = $this->requestStack->getCurrentRequest()?->getLocale();

        return $this->translator->trans($id, [], 'admin', $locale);
    }
}
